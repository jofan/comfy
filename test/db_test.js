"use strict";

const test = require('tape');

const env = process.env;
const db = require('../')('http://db:5984', {
    user: env.COUCHDB_USER,
    password: env.COUCHDB_PASSWORD
});

// Assumption: couchDB server is running at port 5984
// TODO: add fixtures

test('create system databases', function(t) {
    db.setup(function(err, errors) {
        if (err) {
            console.log(errors);
        }
        t.error(err);
        t.end();
    });
});

// Create a database
test('create database', function(t) {
    db.create('db_test', function(err, response) {
        t.error(err);
        t.equal(response.msg, "Database db_test was created");
        t.end();
    });
});

test('create index', function(t) {
    db.create_index('db_test', {
        "index": {
            "fields": ["_id"]
        },
        "type": "json",
        "name" : "id-index"
    }, function(err, response) {
        t.error(err);
        t.equal(response.name, "id-index");
        t.end();
    });
});

test('insert document', function(t) {
    db.insert('db_test', {
        "name": "test-doc",
        "list": ["one", "two"],
        "obj": {"key":"val"}
    }, function(err, response) {
        t.error(err);
        t.equal(response.error, undefined);
        t.equal(response.ok, true);
        t.end();
    });
});

test('get document', function(t) {
    db.insert('db_test', {
        "_id": "test02",
        "name": "test-doc2"
    }, function(err, response) {
        db.get('db_test', 'test02', function(err, doc) {
            t.error(err);
            t.equal(doc.name, "test-doc2");
            t.end();
        });
    });
});

test('find documents', function(t) {
    db.find('db_test', {
        "selector": {
            "name": "test-doc"
        }
    }, function(err, results) {
        t.error(err);
        t.deepEqual(results.docs[0].list, ["one", "two"]);
        t.end();
    });
});

test('update document', function(t) {
    db.insert('db_test', {
        "name": "test-doc"
    }, function(err, response) {
        var id = response.id;
        var rev = response.rev;
        db.update(
            'db_test',
            id,
            {"name":"test-doc-updated", _rev: rev},
            function(err, result) {
                t.error(err);
                t.equal(result.ok, true);
                t.end();
            }
        );
    });
});

test('delete document', function(t) {
    db.insert('db_test', {
        "name": "test-doc-delete"
    }, function(err, response) {
        var id = response.id;
        var rev = response.rev;
        db.remove('db_test', id, rev, function(err, result) {
            t.error(err);
            t.equal(result.ok, true);
            t.end();
        });
    });
});

test('destroy database', function(t) {
    db.destroy('db_test', function(err, result) {
        t.error(err);
        t.equal(result.ok, true);
        t.end();
    });
});
