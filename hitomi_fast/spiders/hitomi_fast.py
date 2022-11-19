# -*- coding: utf-8 -*-
import logging
import os
from multiprocessing import Process
from pathlib import Path

import js2py
import scrapy
from pony import orm
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from hitomi_fast.spiders.schema import Gallery
from hitomi_fast.spiders.schema import Gallery404
from hitomi_fast.spiders.schema import Picture
from hitomi_fast.spiders.utilities import start_http_server


# noinspection PyMethodMayBeStatic
class HitomiFastSpider(scrapy.Spider):
    name = 'hitomi_fast'
    project_path = Path(__file__).parents[1]
    runtime_path = project_path / 'runtime'
    updater_path = runtime_path / 'update.sh'
    gallery_template = 'https://ltn.hitomi.la/galleries/{}.js'
    reader_template = 'https://hitomi.la/reader/{}.html'

    def __init__(self, name=None, **kwargs):
        super().__init__(name, **kwargs)
        # define the range to crawl
        self.start = int(kwargs['start'])
        self.stop = int(kwargs['stop'])
        # create javascript runtime
        self.host = kwargs.get('host', '127.0.0.1')
        self.port = int(kwargs.get('port', 8080))
        self.server = Process(target=start_http_server, kwargs={
            'root': self.runtime_path.as_posix(),
            'host': self.host, 'port': self.port
        }, daemon=True)
        self.server.start()
        self.browser = None
        self.browser_calls = 0
        # configure logger settings
        logging.getLogger('selenium').propagate = False
        logging.getLogger('selenium').setLevel(logging.ERROR)
        logging.getLogger('urllib3').propagate = False
        logging.getLogger('urllib3').setLevel(logging.ERROR)

    def start_requests(self):
        for i in range(self.start, self.stop):
            url = self.gallery_template.format(i)
            # skip visited 404 galleries
            if Gallery404.is_404(i): continue
            # skip the already crawled gallery
            if Gallery.is_crawled(i): continue
            yield scrapy.Request(
                url, self.parse_gallery,
                meta={'handle_httpstatus_list': [404]},
                cb_kwargs={'gallery_id': i}
            )

    def parse(self, response, **kwargs):
        return self.parse_gallery(response, **kwargs)

    def parse_gallery(self, response, **kwargs):
        # save 404 gallery but do not parse
        if response.status == 404:
            with orm.db_session:
                id = kwargs['gallery_id']
                Gallery404.insert_if_not_exists(id)
                return
        # run javascript to get the json data
        js = response.body.decode('utf-8')
        interpreter = js2py.EvalJs()
        interpreter.execute(js)
        info = interpreter.galleryinfo
        # deal with gallery properties
        gallery_id = int(info['id'])
        gallery_url = info['galleryurl']
        title = info['title']
        info_artists = info['artists'] or []
        artists = [x['artist'] for x in info_artists]
        artists = Gallery.dumps_list(artists)
        date = info['date'] or ''
        info_groups = info['groups'] or []
        groups = [x['group'] for x in info_groups]
        groups = Gallery.dumps_list(groups)
        type = info['type'] or ''
        language = info['language'] or ''
        info_series = info['parodys'] or []
        series = [x['parody'] for x in info_series]
        series = Gallery.dumps_list(series)
        info_characters = info['characters'] or []
        characters = [x['character'] for x in info_characters]
        characters = Gallery.dumps_list(characters)
        tags = []
        info_tags = info['tags'] or []
        for each in info_tags:
            if each.get('female', None):
                tags.append([each['tag'], 'female'])
            elif each.get('male', None):
                tags.append([each['tag'], 'male'])
            else:
                tags.append([each['tag'], ''])
        tags = Gallery.dumps_list(tags)
        files = [x for x in info['files'] if x['hasavif']]
        # build the gallery object
        with orm.db_session:
            gallery = Gallery.insert_or_update(
                gallery_id=gallery_id,
                gallery_url=gallery_url,
                title=title,
                artists=artists,
                date=date,
                groups=groups,
                type=type,
                language=language,
                series=series,
                characters=characters,
                tags=tags,
                total_pictures=len(files),
            )
        # build picture requests
        for each in files:
            # generate the picture url
            function = 'url_from_url_from_hash'
            args = [gallery_id, each, "'avif'", "'a'"]
            script = "return {}({},{},{},undefined,{})"
            script = script.format(function, *args)
            picture_url = self.execute_script(script)
            # skip the already crawled picture
            if Picture.is_crawled(gallery_id, each['hash']): continue
            # build the request with referer
            referer = self.reader_template.format(gallery_id)
            yield scrapy.Request(
                picture_url, self.parse_picture,
                headers={'referer': referer},
                cb_kwargs={'gallery': gallery, 'picture': each}
            )

    def parse_picture(self, response, **kwargs):
        # save the picture
        gallery_id = kwargs['gallery'].gallery_id
        gallery_path = Path(f'gallery/{gallery_id}')
        gallery_path.mkdir(parents=True, exist_ok=True)
        picture_hash = kwargs['picture']['hash']
        picture_name = f'{picture_hash}.avif'
        picture_path = gallery_path / picture_name
        with picture_path.open('wb') as fp:
            fp.write(response.body)
        # build the picture object
        with orm.db_session:
            picture = Picture(
                gallery_id=gallery_id,
                picture_hash=picture_hash,
                picture_url=response.request.url,
                picture_path=picture_path.as_posix(),
                gallery=Gallery[gallery_id],
            )

    def execute_script(self, script):
        # restart runtime after every 50 calls
        if self.browser_calls == 50:
            self.browser.quit()
            self.browser = None
            self.browser_calls = 0
        if self.browser is None:
            # update javascript runtime
            command = f'bash {self.updater_path.as_posix()}'
            status_code = os.system(command)
            if status_code != 0:
                raise OSError(f'updater exits unexpectedly: {status_code}')
            # load javascript runtime
            options = Options()
            options.add_argument('--headless')
            options.add_experimental_option('excludeSwitches', ['enable-logging'])
            browser = webdriver.Chrome(options=options)
            browser.get(f'http://{self.host}:{self.port}/index.html')
            self.browser = browser
        # run the script in the browser
        result = self.browser.execute_script(script)
        self.browser_calls += 1
        return result
