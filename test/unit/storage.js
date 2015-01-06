'use strict';

/* global BinStorage, arrayBufferToStringArray, numberArrayToStringArray */

module('BinStorage');

test('create instance', function() {
  var storage = new BinStorage();
  ok(!storage.loaded, 'Passed!');
});

var resStringArray = numberArrayToStringArray([
  0x0001, 0x0000, // Table0 header
  0x0041,         // Table0 key table
  0x0000,         // pad
  0x000c, 0x0000, // Table0 ptr table, ptr to table1 (32bit LE)

  0x0001, 0x0000, // Table1 header
  0x0042,         // Table1 key table
  0x0000,         // pad
  0x0018, 0x0000, // Table1 ptr table, ptr to table2 (32bit LE)

  0x0001, 0x0005, // Table2 header
  0x1111, 0x2222, 0x3333, 0x4444, 0x5555, // Table2 content
  0x0043,         // Table2 key table
  0x002c, 0x0000, // Table2 ptr table, ptr to table3 (32bit LE)

  0x0000, 0x0004, // Table3 header
  0x6666, 0x7777, 0x8888, 0x9999 // Table3 content
]);

test('load()', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/test.data';
  expect(3);
  storage.onload = function() {
    ok(storage.loaded, 'Passed!');
  };
  storage.onloadend = function() {
    ok(storage.loaded, 'Passed!');
    deepEqual(arrayBufferToStringArray(storage._bin), resStringArray);
    start();
  };

  stop();
  storage.load();
});

test('load() non-exist files', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/404.data';
  expect(2);
  storage.onerror = function() {
    ok(true, 'Passed!');
  };
  storage.onloadend = function() {
    ok(!storage.loaded, 'Passed!');
    start();
  };

  stop();
  storage.load();
});

test('unload()', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/test.data';
  expect(4);
  storage.onloadend = function() {
    ok(storage.loaded, 'Passed!');
    deepEqual(arrayBufferToStringArray(storage._bin), resStringArray);
    storage.unload();
    ok(!storage.loaded, 'Passed!');
    equal(storage._bin, undefined, 'Data purged');
    start();
  };

  stop();
  storage.load();
});

test('get()', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/test.data';
  expect(3);
  storage.onloadend = function() {
    var value = storage.get(String.fromCharCode(0x41, 0x42, 0x43));
    deepEqual(arrayBufferToStringArray(value[0]), resStringArray);
    equal(value[1], 0x2c + 4 /* start address of Table3 content */);
    equal(value[2], 4 /* length of Table3 content */, 'Passed!');
    start();
  };

  stop();
  storage.load();
});

test('get() (not found)', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/test.data';
  expect(1);
  storage.onloadend = function() {
    var value = storage.get(String.fromCharCode(0x41, 0x42, 0x45));
    equal(value, undefined, 'Passed!');
    start();
  };

  stop();
  storage.load();
});

test('getRange()', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/test.data';
  expect(4);
  storage.onloadend = function() {
    var value = storage.getRange(String.fromCharCode(0x41, 0x42));
    equal(value.length, 1, 'Passed!');
    deepEqual(arrayBufferToStringArray(value[0][0]), resStringArray);
    equal(value[0][1], 0x2c + 4 /* start address of Table3 content */);
    equal(value[0][2], 4 /* length of Table3 content */, 'Passed!');
    start();
  };

  stop();
  storage.load();
});

test('getRange() (not found)', function() {
  var storage = new BinStorage();
  storage.DATA_URL = './resources/test.data';
  expect(1);
  storage.onloadend = function() {
    var value = storage.getRange(String.fromCharCode(0x41, 0x42, 0x45));
    deepEqual(value, [], 'Passed!');
    start();
  };

  stop();
  storage.load();
});
