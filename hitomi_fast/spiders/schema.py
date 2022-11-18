# -*- coding: utf-8 -*-
import json

from pony import orm

db = orm.Database()


class Gallery(db.Entity):
    gallery_id = orm.PrimaryKey(int, auto=False)
    gallery_url = orm.Required(str)
    title = orm.Required(str)
    artists = orm.Optional(str)
    date = orm.Optional(str)
    groups = orm.Optional(str)
    type = orm.Optional(str)
    language = orm.Optional(str)
    series = orm.Optional(str)
    characters = orm.Optional(str)
    tags = orm.Optional(str)
    pictures = orm.Set('Picture')
    total_pictures = orm.Required(int)

    def __str__(self):
        data = self.to_dict()
        return json.dumps(data, ensure_ascii=False, indent=2)

    @classmethod
    def dumps_list(cls, data):
        return json.dumps(data, ensure_ascii=False)

    @classmethod
    def insert_or_update(cls, **kwargs):
        gallery = cls.get(gallery_id=kwargs['gallery_id'])
        if gallery is not None:
            gallery.set(**kwargs)
            return gallery
        return cls(**kwargs)

    @classmethod
    @orm.db_session
    def is_crawled(cls, id: int):
        gallery = cls.get(gallery_id=id)
        if gallery is not None:
            total_pictures = gallery.total_pictures
            crawled_pictures = len(gallery.pictures)
            return crawled_pictures == total_pictures
        return False


class Gallery404(db.Entity):
    gallery_id = orm.PrimaryKey(int, auto=False)

    @classmethod
    def insert_if_not_exists(cls, id: int):
        gallery = cls.get(gallery_id=id)
        if gallery is not None:
            return gallery
        return cls(gallery_id=id)

    @classmethod
    @orm.db_session
    def is_404(cls, id: int):
        gallery = cls.get(gallery_id=id)
        return gallery is not None


class Picture(db.Entity):
    gallery_id = orm.Required(int)
    picture_hash = orm.Required(str)
    orm.PrimaryKey(gallery_id, picture_hash)
    picture_url = orm.Required(str)
    picture_path = orm.Required(str)
    gallery = orm.Required('Gallery')

    def __str__(self):
        data = self.to_dict()
        return json.dumps(data, ensure_ascii=False, indent=2)

    @classmethod
    @orm.db_session
    def is_crawled(cls, gallery_id: int, picture_hash: str):
        picture = cls.get(gallery_id=gallery_id, picture_hash=picture_hash)
        return picture is not None


# db.bind(provider='sqlite', filename=':sharedmemory:')
db.bind(provider='sqlite', filename='hitomi.sqlite', create_db=True)
db.generate_mapping(create_tables=True)
