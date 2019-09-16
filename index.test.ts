import {Comparison} from "@softwareventures/ordered";
import test from "ava";
import {
    add,
    compare,
    equal,
    format,
    formatFixed,
    fromBytes,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    max,
    min,
    multiply,
    multiplyBytesExtended,
    normalize,
    notEqual,
    round,
    subtract,
    toBytes
} from ".";

test("normalize", t => {
    t.deepEqual({...normalize({})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 1})}, {units: 1, billionths: 0});
    t.deepEqual({...normalize({billionths: 1})}, {units: 0, billionths: 1});
    t.deepEqual({...normalize({units: 1, billionths: 1})}, {units: 1, billionths: 1});
    t.deepEqual({...normalize({units: -1})}, {units: -1, billionths: 0});
    t.deepEqual({...normalize({billionths: -1})}, {units: 0, billionths: -1});
    t.deepEqual({...normalize({units: 1, billionths: -1})}, {units: 0, billionths: 999999999});
    t.deepEqual({...normalize({units: -1, billionths: 1})}, {units: 0, billionths: -999999999});
    t.deepEqual({...normalize({units: 1.1})}, {units: 1, billionths: 100000000});
    t.deepEqual({...normalize({units: 1.1, billionths: 123456789})}, {units: 1, billionths: 223456789});
    t.deepEqual({...normalize({units: -1.1})}, {units: -1, billionths: -100000000});
    t.deepEqual({...normalize({units: -2, billionths: 1})}, {units: -1, billionths: -999999999});
    t.deepEqual({...normalize({units: 1 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({billionths: 1 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 1 / 0, billionths: 3})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 4, billionths: 1 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: -1 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 6, billionths: -1 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: -1 / 0, billionths: 1 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 0 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 0 / 0, billionths: 1})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 3, billionths: 0 / 0})}, {units: 0, billionths: 0});
    t.deepEqual({...normalize({units: 5, billionths: 111111111.1})}, {units: 5, billionths: 111111111});
    t.deepEqual({...normalize({units: 7, billionths: 111111111.5})}, {units: 7, billionths: 111111112});
    t.deepEqual({...normalize({units: 9, billionths: 999999999.5})}, {units: 10, billionths: 0});
});

test("toString", t => {
    t.is(normalize({}).toString(), "Decimal 0");
    t.is(normalize({units: 1}).toString(), "Decimal 1");
    t.is(normalize({billionths: 1}).toString(), "Decimal 0.000000001");
    t.is(normalize({billionths: 21}).toString(), "Decimal 0.000000021");
    t.is(normalize({billionths: 30}).toString(), "Decimal 0.00000003");
    t.is(normalize({units: 1, billionths: 1}).toString(), "Decimal 1.000000001");
    t.is(normalize({units: -1}).toString(), "Decimal -1");
    t.is(normalize({billionths: -1}).toString(), "Decimal -0.000000001");
    t.is(normalize({units: 1, billionths: -1}).toString(), "Decimal 0.999999999");
    t.is(normalize({units: -1, billionths: 1}).toString(), "Decimal -0.999999999");
    t.is(normalize({units: 1, billionths: 100000000}).toString(), "Decimal 1.1");
    t.is(normalize({units: 2, billionths: 340000000}).toString(), "Decimal 2.34");
    t.is(normalize({units: 1 / 0}).toString(), "Decimal 0");
    t.is(normalize({units: -1 / 0}).toString(), "Decimal 0");
    t.is(normalize({units: 0 / 0}).toString(), "Decimal 0");
});

test("format", t => {
    t.is(format({}), "0");
    t.is(format({units: 1}), "1");
    t.is(format({billionths: 1}), "0.000000001");
    t.is(format({billionths: 21}), "0.000000021");
    t.is(format({billionths: 30}), "0.00000003");
    t.is(format({units: 1, billionths: 1}), "1.000000001");
    t.is(format({units: -1}), "-1");
    t.is(format({billionths: -1}), "-0.000000001");
    t.is(format({units: 1, billionths: -1}), "0.999999999");
    t.is(format({units: -1, billionths: 1}), "-0.999999999");
    t.is(format({units: 1, billionths: 100000000}), "1.1");
    t.is(format({units: 2, billionths: 340000000}), "2.34");
    t.is(format({units: 1 / 0}), "0");
    t.is(format({units: -1 / 0}), "0");
    t.is(format({units: 0 / 0}), "0");
});

test("formatFixed", t => {
    t.is(formatFixed({}), "0");
    t.is(formatFixed({units: 1}, 9), "1.000000000");
    t.is(formatFixed({units: 1}, 10), "1.000000000");
    t.is(formatFixed({units: 1}, -1), "1");
    t.is(formatFixed({units: 1}, 2), "1.00");
    t.is(formatFixed({billionths: 1}, 9), "0.000000001");
    t.is(formatFixed({billionths: 1}, 8), "0.00000000");
    t.is(formatFixed({billionths: 21}, 9), "0.000000021");
    t.is(formatFixed({billionths: 21}, 8), "0.00000002");
    t.is(formatFixed({billionths: 21}, 7), "0.0000000");
    t.is(formatFixed({billionths: 30}, 9), "0.000000030");
    t.is(formatFixed({billionths: 30}, 8), "0.00000003");
    t.is(formatFixed({billionths: 30}, 7), "0.0000000");
    t.is(formatFixed({billionths: 50}, 9), "0.000000050");
    t.is(formatFixed({billionths: 50}, 8), "0.00000005");
    t.is(formatFixed({billionths: 50}, 7), "0.0000001");
    t.is(formatFixed({units: 1, billionths: 1}, 9), "1.000000001");
    t.is(formatFixed({units: 1, billionths: 1}, 8), "1.00000000");
    t.is(formatFixed({units: 1, billionths: 1}), "1");
    t.is(formatFixed({units: -1}, 2), "-1.00");
    t.is(formatFixed({units: -1}), "-1");
    t.is(formatFixed({billionths: -1}, 9), "-0.000000001");
    t.is(formatFixed({billionths: -1}, 2), "-0.00");
    t.is(formatFixed({units: 1, billionths: -1}, 9), "0.999999999");
    t.is(formatFixed({units: 1, billionths: -1}, 8), "1.00000000");
    t.is(formatFixed({units: 1, billionths: -1}, 2), "1.00");
    t.is(formatFixed({units: -1, billionths: 1}, 9), "-0.999999999");
    t.is(formatFixed({units: -1, billionths: 1}, 8), "-1.00000000");
    t.is(formatFixed({units: -1, billionths: 1}, 2), "-1.00");
    t.is(formatFixed({units: -1, billionths: 1}), "-1");
    t.is(formatFixed({units: 1, billionths: 100000000}, 2), "1.10");
    t.is(formatFixed({units: 1, billionths: 100000000}, 1), "1.1");
    t.is(formatFixed({units: 1, billionths: 100000000}), "1");
    t.is(formatFixed({units: 2, billionths: 340000000}, 4), "2.3400");
    t.is(formatFixed({units: 2, billionths: 340000000}, 2), "2.34");
    t.is(formatFixed({units: 2, billionths: 340000000}, 1), "2.3");
    t.is(formatFixed({units: 2, billionths: 340000000}), "2");
    t.is(formatFixed({units: 1 / 0}), "0");
    t.is(formatFixed({units: -1 / 0}), "0");
    t.is(formatFixed({units: 0 / 0}), "0");
});

test("add", t => {
    t.deepEqual(add(0, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(add(0, {units: 1, billionths: 999999999}), normalize({units: 1, billionths: 999999999}));
    t.deepEqual(add({units: 2, billionths: 999999999}, 0), normalize({units: 2, billionths: 999999999}));
    t.deepEqual(add({units: 3, billionths: 999999876}, {units: 1, billionths: 123}),
        normalize({units: 4, billionths: 999999999}));
    t.deepEqual(add({units: 3, billionths: 999999876}, {units: 1, billionths: 124}),
        normalize({units: 5, billionths: 0}));
    t.deepEqual(add({units: 3, billionths: 999999876}, {units: 1, billionths: 125}),
        normalize({units: 5, billionths: 1}));
    t.deepEqual(add({units: 3, billionths: 999999876}, {units: -1, billionths: -124}),
        normalize({units: 2, billionths: 999999752}));
    t.deepEqual(add({units: 3, billionths: 999999876}, {units: -2}),
        normalize({units: 1, billionths: 999999876}));
    t.deepEqual(add({units: -2, billionths: -999999879}, {units: 5, billionths: 999999876}),
        normalize({units: 2, billionths: 999999997}));
    t.deepEqual(add({units: 7, billionths: 999999876}, {units: -1, billionths: -999999875}),
        normalize({units: 6, billionths: 1}));
});

test("subtract", t => {
    t.deepEqual(subtract(0, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(subtract(0, {units: 1, billionths: 999999999}), normalize({units: -1, billionths: -999999999}));
    t.deepEqual(subtract({units: 2, billionths: 999999999}, 0), normalize({units: 2, billionths: 999999999}));
    t.deepEqual(subtract({units: 3, billionths: 999999876}, {units: 1, billionths: 123}),
        normalize({units: 2, billionths: 999999753}));
    t.deepEqual(subtract({units: 3, billionths: 123}, {units: 1, billionths: 122}),
        normalize({units: 2, billionths: 1}));
    t.deepEqual(subtract({units: 3, billionths: 123}, {units: 1, billionths: 123}),
        normalize({units: 2, billionths: 0}));
    t.deepEqual(subtract({units: 3, billionths: 123}, {units: 1, billionths: 124}),
        normalize({units: 1, billionths: 999999999}));
    t.deepEqual(subtract({units: 3, billionths: 999999876}, {units: -1, billionths: -124}),
        normalize({units: 5, billionths: 0}));
    t.deepEqual(subtract({units: 3, billionths: 999999876}, {units: -2}),
        normalize({units: 5, billionths: 999999876}));
    t.deepEqual(subtract({units: -2, billionths: -999999879}, {units: 5, billionths: 999999876}),
        normalize({units: -8, billionths: -999999755}));
    t.deepEqual(subtract({units: 2, billionths: 999999876}, {units: 5, billionths: 999999879}),
        normalize({units: -3, billionths: -3}));
    t.deepEqual(subtract({units: 7, billionths: 999999876}, {units: 1, billionths: 999999875}),
        normalize({units: 6, billionths: 1}));
});

test("multiply", t => {
    t.deepEqual(multiply(0, 0), normalize(0));
    t.deepEqual(multiply(0, {billionths: 0x3557}), normalize(0));
    t.deepEqual(multiply(0, {billionths: 0xf0e40000}), normalize(0));
    t.deepEqual(multiply(0, {units: 0x0ac7}), normalize(0));
    t.deepEqual(multiply(0, {units: 0x5dc70000}), normalize(0));
    t.deepEqual(multiply({billionths: 0x084c}, 0), normalize(0));
    t.deepEqual(multiply({billionths: 0xaf22}, {billionths: 0x10a3}), normalize(0));
    t.deepEqual(multiply({billionths: 0xffff}, {billionths: 0xffff}), normalize({billionths: 4}));
    t.deepEqual(multiply({billionths: 0x5d59}, {billionths: 0x2aa50000}), normalize({billionths: 17097}));
    t.deepEqual(multiply({billionths: 0x5d5a}, {billionths: 0x2aa50000}), normalize({billionths: 17098}));
    t.deepEqual(multiply({billionths: 0x5e9d}, {units: 0x1928}), normalize({billionths: 155983240}));
    t.deepEqual(multiply({billionths: 0x3351}, {units: 0x620c0000}), normalize({units: 21609, billionths: 755443200}));
    t.deepEqual(multiply({billionths: 0x38bd0000}, 0), normalize(0));
    t.deepEqual(multiply({billionths: 0x1e020000}, {billionths: 0x837e}), normalize({billionths: 16947}));
    t.deepEqual(multiply({billionths: 0x17930000}, {billionths: 0x1e8a0000}), normalize({billionths: 202643558}));
    t.deepEqual(multiply({billionths: 0x0c170000}, {units: 0x4379}), normalize({units: 3503, billionths: 550300160}));
    t.deepEqual(multiply({billionths: 0x11220000}, {units: 0x3c490000}),
        normalize({units: 290722634, billionths: 4430848}));
    t.deepEqual(multiply({units: 0x6e58}, 0), normalize(0));
    t.deepEqual(multiply({units: 0x3dc7}, {billionths: 0xcfd7}), normalize({billionths: 0x3227cb21}));
    t.deepEqual(multiply({units: 0x5685}, {billionths: 0x1bbc0000}), normalize({units: 10306, billionths: 53734400}));
    t.deepEqual(multiply({units: 0xf72a}, {units: 0x6839}), normalize({units: 0x64a0185a}));
    t.deepEqual(multiply({units: 0x432c}, {units: 0x4b020000}), normalize({units: 0x6a580000}));
    t.deepEqual(multiply({units: 0x943a0000}, 0), normalize(0));
    t.deepEqual(multiply({units: 0x1ede0000}, {billionths: 0xf78a}), normalize({units: 32817, billionths: 134960640}));
    t.deepEqual(multiply({units: 0x09360000}, {billionths: 0x30ae0000}),
        normalize({units: 126209314, billionths: 800009216}));
    t.deepEqual(multiply({units: 0x36f60000}, {units: 0x11d1}), normalize({units: 0x34d60000}));
    t.deepEqual(multiply({units: 0x1fc90000}, {units: 0x264e0000}), normalize(0));
    t.deepEqual(multiply(0, {billionths: -0x3557}), normalize(0));
    t.deepEqual(multiply(0, {billionths: -0xf0e40000}), normalize(0));
    t.deepEqual(multiply(0, {units: -0x0ac7}), normalize(0));
    t.deepEqual(multiply(0, {units: -0x5dc70000}), normalize(0));
    t.deepEqual(multiply({billionths: 0xaf22}, {billionths: -0x10a3}), normalize(0));
    t.deepEqual(multiply({billionths: 0xffff}, {billionths: -0xffff}), normalize({billionths: -4}));
    t.deepEqual(multiply({billionths: 0x5d59}, {billionths: -0x2aa50000}), normalize({billionths: -17097}));
    t.deepEqual(multiply({billionths: 0x5d5a}, {billionths: -0x2aa50000}), normalize({billionths: -17098}));
    t.deepEqual(multiply({billionths: 0x5e9d}, {units: -0x1928}), normalize({billionths: -155983240}));
    t.deepEqual(multiply({billionths: 0x3351}, {units: -0x620c0000}),
        normalize({units: -21609, billionths: -755443200}));
    t.deepEqual(multiply({billionths: 0x1e020000}, {billionths: -0x837e}), normalize({billionths: -16947}));
    t.deepEqual(multiply({billionths: 0x17930000}, {billionths: -0x1e8a0000}), normalize({billionths: -202643558}));
    t.deepEqual(multiply({billionths: 0x0c170000}, {units: -0x4379}),
        normalize({units: -3503, billionths: -550300160}));
    t.deepEqual(multiply({billionths: 0x11220000}, {units: -0x3c490000}),
        normalize({units: -290722634, billionths: -4430848}));
    t.deepEqual(multiply({units: 0x3dc7}, {billionths: -0xcfd7}), normalize({billionths: -0x3227cb21}));
    t.deepEqual(multiply({units: 0x5685}, {billionths: -0x1bbc0000}),
        normalize({units: -10306, billionths: -53734400}));
    t.deepEqual(multiply({units: 0xf72a}, {units: -0x6839}), normalize({units: -0x64a0185a}));
    t.deepEqual(multiply({units: 0x432c}, {units: -0x4b020000}), normalize({units: -0x6a580000}));
    t.deepEqual(multiply({units: 0x1ede0000}, {billionths: -0xf78a}),
        normalize({units: -32817, billionths: -134960640}));
    t.deepEqual(multiply({units: 0x09360000}, {billionths: -0x30ae0000}),
        normalize({units: -126209314, billionths: -800009216}));
    t.deepEqual(multiply({units: 0x36f60000}, {units: -0x11d1}), normalize({units: -0x34d60000}));
    t.deepEqual(multiply({units: 0x1fc90000}, {units: -0x264e0000}), normalize(0));
    t.deepEqual(multiply(123, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply(0, {units: 123, billionths: 456789}), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply({units: -3456, billionths: -8765}, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply({billionths: 0x7e8c}, {billionths: 0x1d0c}), normalize(0));
    t.deepEqual(multiply({billionths: 0x7e8d}, {billionths: 0x1d0c}), normalize(0));
    t.deepEqual(multiply({billionths: 0x7e8c}, {billionths: 0x21d90000}), normalize({billionths: 0x47dd}));
    t.deepEqual(multiply({billionths: 0x7e8d}, {billionths: 0x21d90000}), normalize({billionths: 0x47dd}));
    t.deepEqual(multiply({billionths: 0x7e8c}, {billionths: 0x21d91d0c}), normalize({billionths: 0x47dd}));
    t.deepEqual(multiply({billionths: 0x345f0000}, {billionths: 0x1d0c}), normalize({billionths: 0x1986}));
    t.deepEqual(multiply({billionths: 0x345f0000}, {billionths: 0x21d90000}), normalize({billionths: 0x1dbd6cf3}));
    t.deepEqual(multiply({billionths: 0x345f7e8c}, {billionths: 0x1d0c}), normalize({billionths: 0x1986}));
    t.deepEqual(multiply({billionths: 0x345f7e8d}, {billionths: 0x1d0c}), normalize({billionths: 0x1986}));
});

test.failing("multiply high precision", t => {
    t.deepEqual(multiply({billionths: 0x7e8d}, {billionths: 0x21d91d0c}), normalize({billionths: 0x47de}));
    t.deepEqual(multiply({billionths: 0x345f7e8c}, {billionths: 0x21d90000}), normalize({billionths: 0x1dbdce55}));
    t.deepEqual(multiply({billionths: 0x345f7e8c}, {billionths: 0x21d90000}), normalize({billionths: 0x1dbdce56}));
    t.deepEqual(multiply({billionths: 878673548}, {billionths: 567876876}), normalize({billionths: 498978389}));
    t.deepEqual(multiply({billionths: 878673549}, {billionths: 567876876}), normalize({billionths: 498978390}));
    t.deepEqual(multiply({billionths: 878673550}, {billionths: 567876876}), normalize({billionths: 498978391}));
    t.deepEqual(multiply({billionths: 878673551}, {billionths: 567876876}), normalize({billionths: 498978391}));
    t.deepEqual(multiply({billionths: 878673552}, {billionths: 567876876}), normalize({billionths: 498978392}));
    t.deepEqual(multiply({billionths: 878673553}, {billionths: 567876876}), normalize({billionths: 498978392}));
    t.deepEqual(multiply({units: 35782, billionths: 876567876}, {units: 55676, billionths: 554567865}),
        normalize({units: 1992267279, billionths: 826525982}));
    t.deepEqual(multiply({units: 35783, billionths: 876567876}, {units: 55676, billionths: 554567865}),
        normalize({units: 1992322956, billionths: 381093847}));
    t.deepEqual(multiply({units: 35783, billionths: 876567877}, {units: 55676, billionths: 554567865}),
        normalize({units: 1992322956, billionths: 381149523}));
    t.deepEqual(multiply({units: 35783, billionths: 876567878}, {units: 55676, billionths: 554567865}),
        normalize({units: 1992322956, billionths: 381205200}));
    t.deepEqual(multiply({units: 35783, billionths: 876567879}, {units: 55676, billionths: 554567865}),
        normalize({units: 1992322956, billionths: 381260876}));
    t.deepEqual(multiply({units: 35783, billionths: 876567880}, {units: 55676, billionths: 554567865}),
        normalize({units: 1992322956, billionths: 381316553}));
    t.deepEqual(multiply({units: 35783, billionths: 876567880}, {units: 55676, billionths: 876567876}),
        normalize({units: 1992334478, billionths: 789965033}));
    t.deepEqual(multiply({units: 35783, billionths: 876567881}, {units: 55676, billionths: 876567876}),
        normalize({units: 1992334478, billionths: 790020710}));
    t.deepEqual(multiply({units: 35783, billionths: 876567882}, {units: 55676, billionths: 876567876}),
        normalize({units: 1992334478, billionths: 790076386}));
});

test("lessThan", t => {
    t.false(lessThan({units: 2, billionths: 1234}, {units: 2, billionths: 1234}));
    t.false(lessThan({units: 2, billionths: 1234}, {units: 2, billionths: 123}));
    t.true(lessThan({units: 2, billionths: 1234}, {units: 2, billionths: 12345}));
    t.false(lessThan({units: 3, billionths: 123}, {units: 2, billionths: 1234}));
    t.true(lessThan({units: 3, billionths: 123}, {units: 4, billionths: 12}));
    t.false(lessThan({units: -2, billionths: -1234}, {units: -2, billionths: -1234}));
    t.true(lessThan({units: -2, billionths: -1234}, {units: -2, billionths: -123}));
    t.false(lessThan({units: -2, billionths: -1234}, {units: -2, billionths: -12345}));
});

test("lessThanOrEqual", t => {
    t.true(lessThanOrEqual({units: 2, billionths: 1234}, {units: 2, billionths: 1234}));
    t.false(lessThanOrEqual({units: 2, billionths: 1234}, {units: 2, billionths: 123}));
    t.true(lessThanOrEqual({units: 2, billionths: 1234}, {units: 2, billionths: 12345}));
    t.false(lessThanOrEqual({units: 3, billionths: 123}, {units: 2, billionths: 1234}));
    t.true(lessThanOrEqual({units: 3, billionths: 123}, {units: 4, billionths: 12}));
    t.true(lessThanOrEqual({units: -2, billionths: -1234}, {units: -2, billionths: -1234}));
    t.true(lessThanOrEqual({units: -2, billionths: -1234}, {units: -2, billionths: -123}));
    t.false(lessThanOrEqual({units: -2, billionths: -1234}, {units: -2, billionths: -12345}));
});

test("greaterThan", t => {
    t.false(greaterThan({units: 2, billionths: 1234}, {units: 2, billionths: 1234}));
    t.true(greaterThan({units: 2, billionths: 1234}, {units: 2, billionths: 123}));
    t.false(greaterThan({units: 2, billionths: 1234}, {units: 2, billionths: 12345}));
    t.true(greaterThan({units: 3, billionths: 123}, {units: 2, billionths: 1234}));
    t.false(greaterThan({units: 3, billionths: 123}, {units: 4, billionths: 12}));
    t.false(greaterThan({units: -2, billionths: -1234}, {units: -2, billionths: -1234}));
    t.false(greaterThan({units: -2, billionths: -1234}, {units: -2, billionths: -123}));
    t.true(greaterThan({units: -2, billionths: -1234}, {units: -2, billionths: -12345}));
});

test("greaterThanOrEqual", t => {
    t.true(greaterThanOrEqual({units: 2, billionths: 1234}, {units: 2, billionths: 1234}));
    t.true(greaterThanOrEqual({units: 2, billionths: 1234}, {units: 2, billionths: 123}));
    t.false(greaterThanOrEqual({units: 2, billionths: 1234}, {units: 2, billionths: 12345}));
    t.true(greaterThanOrEqual({units: 3, billionths: 123}, {units: 2, billionths: 1234}));
    t.false(greaterThanOrEqual({units: 3, billionths: 123}, {units: 4, billionths: 12}));
    t.true(greaterThanOrEqual({units: -2, billionths: -1234}, {units: -2, billionths: -1234}));
    t.false(greaterThanOrEqual({units: -2, billionths: -1234}, {units: -2, billionths: -123}));
    t.true(greaterThanOrEqual({units: -2, billionths: -1234}, {units: -2, billionths: -12345}));
});

test("equal", t => {
    t.true(equal({units: 2, billionths: 1234}, {units: 2, billionths: 1234}));
    t.false(equal({units: 2, billionths: 1234}, {units: 2, billionths: 123}));
    t.false(equal({units: 2, billionths: 1234}, {units: 2, billionths: 12345}));
    t.false(equal({units: 3, billionths: 123}, {units: 2, billionths: 1234}));
    t.false(equal({units: 3, billionths: 123}, {units: 4, billionths: 12}));
    t.true(equal({units: -2, billionths: -1234}, {units: -2, billionths: -1234}));
    t.false(equal({units: -2, billionths: -1234}, {units: -2, billionths: -123}));
    t.false(equal({units: -2, billionths: -1234}, {units: -2, billionths: -12345}));
});

test("notEqual", t => {
    t.false(notEqual({units: 2, billionths: 1234}, {units: 2, billionths: 1234}));
    t.true(notEqual({units: 2, billionths: 1234}, {units: 2, billionths: 123}));
    t.true(notEqual({units: 2, billionths: 1234}, {units: 2, billionths: 12345}));
    t.true(notEqual({units: 3, billionths: 123}, {units: 2, billionths: 1234}));
    t.true(notEqual({units: 3, billionths: 123}, {units: 4, billionths: 12}));
    t.false(notEqual({units: -2, billionths: -1234}, {units: -2, billionths: -1234}));
    t.true(notEqual({units: -2, billionths: -1234}, {units: -2, billionths: -123}));
    t.true(notEqual({units: -2, billionths: -1234}, {units: -2, billionths: -12345}));
});

test("compare", t => {
    t.is(compare({units: 2, billionths: 1234}, {units: 2, billionths: 1234}), Comparison.equal);
    t.is(compare({units: 2, billionths: 1234}, {units: 2, billionths: 123}), Comparison.after);
    t.is(compare({units: 2, billionths: 1234}, {units: 2, billionths: 12345}), Comparison.before);
    t.is(compare({units: 3, billionths: 123}, {units: 2, billionths: 1234}), Comparison.after);
    t.is(compare({units: 3, billionths: 123}, {units: 4, billionths: 12}), Comparison.before);
    t.is(compare({units: -2, billionths: -1234}, {units: -2, billionths: -1234}), Comparison.equal);
    t.is(compare({units: -2, billionths: -1234}, {units: -2, billionths: -123}), Comparison.before);
    t.is(compare({units: -2, billionths: -1234}, {units: -2, billionths: -12345}), Comparison.after);
});

test("round", t => {
    t.deepEqual(round({units: 0, billionths: 343}), normalize({units: 0, billionths: 0}));
    t.deepEqual(round({units: 6225, billionths: 45683}), normalize({units: 6225, billionths: 0}));
    t.deepEqual(round({units: 4539, billionths: 584928927}), normalize({units: 4540, billionths: 0}));
    t.deepEqual(round({units: 45389, billionths: 500000000}), normalize({units: 45390, billionths: 0}));
    t.deepEqual(round({units: -0, billionths: -343}), normalize({units: 0, billionths: 0}));
    t.deepEqual(round({units: -6225, billionths: -45683}), normalize({units: -6225, billionths: 0}));
    t.deepEqual(round({units: -4539, billionths: -584928927}), normalize({units: -4540, billionths: 0}));
    t.deepEqual(round({units: -45389, billionths: -500000000}), normalize({units: -45389, billionths: 0}));
});

test("max", t => {
    t.deepEqual(max({units: 2, billionths: 1234}, {units: 2, billionths: 1234}),
        normalize({units: 2, billionths: 1234}));
    t.deepEqual(max({units: 2, billionths: 1234}, {units: 2, billionths: 123}),
        normalize({units: 2, billionths: 1234}));
    t.deepEqual(max({units: 2, billionths: 1234}, {units: 2, billionths: 12345}),
        normalize({units: 2, billionths: 12345}));
    t.deepEqual(max({units: 3, billionths: 123}, {units: 2, billionths: 1234}),
        normalize({units: 3, billionths: 123}));
    t.deepEqual(max({units: 3, billionths: 123}, {units: 4, billionths: 12}),
        normalize({units: 4, billionths: 12}));
    t.deepEqual(max({units: -2, billionths: -1234}, {units: -2, billionths: -1234}),
        normalize({units: -2, billionths: -1234}));
    t.deepEqual(max({units: -2, billionths: -1234}, {units: -2, billionths: -123}),
        normalize({units: -2, billionths: -123}));
    t.deepEqual(max({units: -2, billionths: -1234}, {units: -2, billionths: -12345}),
        normalize({units: -2, billionths: -1234}));
});

test("min", t => {
    t.deepEqual(min({units: 2, billionths: 1234}, {units: 2, billionths: 1234}),
        normalize({units: 2, billionths: 1234}));
    t.deepEqual(min({units: 2, billionths: 1234}, {units: 2, billionths: 123}),
        normalize({units: 2, billionths: 123}));
    t.deepEqual(min({units: 2, billionths: 1234}, {units: 2, billionths: 12345}),
        normalize({units: 2, billionths: 1234}));
    t.deepEqual(min({units: 3, billionths: 123}, {units: 2, billionths: 1234}),
        normalize({units: 2, billionths: 1234}));
    t.deepEqual(min({units: 3, billionths: 123}, {units: 4, billionths: 12}),
        normalize({units: 3, billionths: 123}));
    t.deepEqual(min({units: -2, billionths: -1234}, {units: -2, billionths: -1234}),
        normalize({units: -2, billionths: -1234}));
    t.deepEqual(min({units: -2, billionths: -1234}, {units: -2, billionths: -123}),
        normalize({units: -2, billionths: -1234}));
    t.deepEqual(min({units: -2, billionths: -1234}, {units: -2, billionths: -12345}),
        normalize({units: -2, billionths: -12345}));
});

test("toBytes", t => {
    t.deepEqual(toBytes({}), [0, 0, 0, 0, 0, 0, 0, 0, 0]);
    t.deepEqual(toBytes({billionths: 1}), [1, 0, 0, 0, 0, 0, 0, 0, 1]);
    t.deepEqual(toBytes({billionths: 0xff}), [1, 0, 0, 0, 0, 0, 0, 0, 0xff]);
    t.deepEqual(toBytes({billionths: 0x1ff}), [1, 0, 0, 0, 0, 0, 0, 0x1, 0xff]);
    t.deepEqual(toBytes({billionths: 0x19abcdef}), [1, 0, 0, 0, 0, 0x19, 0xab, 0xcd, 0xef]);
    t.deepEqual(toBytes({billionths: -1}), [-1, 0, 0, 0, 0, 0, 0, 0, 1]);
    t.deepEqual(toBytes({billionths: -0xff}), [-1, 0, 0, 0, 0, 0, 0, 0, 0xff]);
    t.deepEqual(toBytes({billionths: -0x1ff}), [-1, 0, 0, 0, 0, 0, 0, 0x1, 0xff]);
    t.deepEqual(toBytes({billionths: -0x19abcdef}), [-1, 0, 0, 0, 0, 0x19, 0xab, 0xcd, 0xef]);
    t.deepEqual(toBytes({units: 1}), [1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x00]);
    t.deepEqual(toBytes({units: 1, billionths: 1}), [1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x01]);
    t.deepEqual(toBytes({units: 1, billionths: 0xff}), [1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0xff]);
    t.deepEqual(toBytes({units: 1, billionths: 0x3600}), [1, 0, 0, 0, 0, 0x3b, 0x9b, 0x00, 0x00]);
    t.deepEqual(toBytes({units: -1}), [-1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x00]);
    t.deepEqual(toBytes({units: -1, billionths: -1}), [-1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x01]);
    t.deepEqual(toBytes({units: -1, billionths: -0xff}), [-1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0xff]);
    t.deepEqual(toBytes({units: -1, billionths: -0x3600}), [-1, 0, 0, 0, 0, 0x3b, 0x9b, 0x00, 0x00]);
    t.deepEqual(toBytes({units: 0x7fffffff, billionths: 999999999}),
        [1, 0x1d, 0xcd, 0x64, 0xff, 0xff, 0xff, 0xff, 0xff]);
    t.deepEqual(toBytes({units: -0x7fffffff, billionths: -999999999}),
        [-1, 0x1d, 0xcd, 0x64, 0xff, 0xff, 0xff, 0xff, 0xff]);
    t.deepEqual(toBytes({units: 140669921, billionths: 519802110}),
        [1, 0x1, 0xf3, 0xc2, 0x8c, 0x5e, 0xc5, 0x16, 0xfe]);
    t.deepEqual(toBytes({units: -140669921, billionths: -519802110}),
        [-1, 0x1, 0xf3, 0xc2, 0x8c, 0x5e, 0xc5, 0x16, 0xfe]);
    t.deepEqual(toBytes({units: 593040895, billionths: 461508546}),
        [1, 0x8, 0x3a, 0xe7, 0x8d, 0x67, 0x43, 0x45, 0xc2]);
    t.deepEqual(toBytes({units: -593040895, billionths: -461508546}),
        [-1, 0x8, 0x3a, 0xe7, 0x8d, 0x67, 0x43, 0x45, 0xc2]);
    t.deepEqual(toBytes({units: 766542927, billionths: 131466229}),
        [1, 0xa, 0xa3, 0x4e, 0xbb, 0x1c, 0xc2, 0x59, 0xf5]);
    t.deepEqual(toBytes({units: -766542927, billionths: -131466229}),
        [-1, 0xa, 0xa3, 0x4e, 0xbb, 0x1c, 0xc2, 0x59, 0xf5]);
    t.deepEqual(toBytes({units: 568361657, billionths: 784795990}),
        [1, 0x7, 0xe3, 0x39, 0xea, 0x9c, 0x37, 0x03, 0x56]);
    t.deepEqual(toBytes({units: -568361657, billionths: -784795990}),
        [-1, 0x7, 0xe3, 0x39, 0xea, 0x9c, 0x37, 0x03, 0x56]);
});

test("fromBytes", t => {
    t.deepEqual(fromBytes([0, 0, 0, 0, 0, 0, 0, 0, 0]), normalize({}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0, 0, 0, 1]), normalize({billionths: 1}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0, 0, 0, 0xff]), normalize({billionths: 0xff}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0, 0, 0x1, 0xff]), normalize({billionths: 0x1ff}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0x19, 0xab, 0xcd, 0xef]), normalize({billionths: 0x19abcdef}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0, 0, 0, 1]), normalize({billionths: -1}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0, 0, 0, 0xff]), normalize({billionths: -0xff}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0, 0, 0x1, 0xff]), normalize({billionths: -0x1ff}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0x19, 0xab, 0xcd, 0xef]), normalize({billionths: -0x19abcdef}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x00]), normalize({units: 1}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x01]), normalize({units: 1, billionths: 1}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0xff]), normalize({units: 1, billionths: 0xff}));
    t.deepEqual(fromBytes([1, 0, 0, 0, 0, 0x3b, 0x9b, 0x00, 0x00]), normalize({units: 1, billionths: 0x3600}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x00]), normalize({units: -1}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x01]), normalize({units: -1, billionths: -1}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0xff]), normalize({units: -1, billionths: -0xff}));
    t.deepEqual(fromBytes([-1, 0, 0, 0, 0, 0x3b, 0x9b, 0x00, 0x00]), normalize({units: -1, billionths: -0x3600}));
    t.deepEqual(fromBytes([1, 0x1d, 0xcd, 0x64, 0xff, 0xff, 0xff, 0xff, 0xff]),
        normalize({units: 0x7fffffff, billionths: 999999999}));
    t.deepEqual(fromBytes([-1, 0x1d, 0xcd, 0x64, 0xff, 0xff, 0xff, 0xff, 0xff]),
        normalize({units: -0x7fffffff, billionths: -999999999}));
    t.deepEqual(fromBytes([1, 0x1, 0xf3, 0xc2, 0x8c, 0x5e, 0xc5, 0x16, 0xfe]),
        normalize({units: 140669921, billionths: 519802110}));
    t.deepEqual(fromBytes([-1, 0x1, 0xf3, 0xc2, 0x8c, 0x5e, 0xc5, 0x16, 0xfe]),
        normalize({units: -140669921, billionths: -519802110}));
    t.deepEqual(fromBytes([1, 0x8, 0x3a, 0xe7, 0x8d, 0x67, 0x43, 0x45, 0xc2]),
        normalize({units: 593040895, billionths: 461508546}));
    t.deepEqual(fromBytes([-1, 0x8, 0x3a, 0xe7, 0x8d, 0x67, 0x43, 0x45, 0xc2]),
        normalize({units: -593040895, billionths: -461508546}));
    t.deepEqual(fromBytes([1, 0xa, 0xa3, 0x4e, 0xbb, 0x1c, 0xc2, 0x59, 0xf5]),
        normalize({units: 766542927, billionths: 131466229}));
    t.deepEqual(fromBytes([-1, 0xa, 0xa3, 0x4e, 0xbb, 0x1c, 0xc2, 0x59, 0xf5]),
        normalize({units: -766542927, billionths: -131466229}));
    t.deepEqual(fromBytes([1, 0x7, 0xe3, 0x39, 0xea, 0x9c, 0x37, 0x03, 0x56]),
        normalize({units: 568361657, billionths: 784795990}));
    t.deepEqual(fromBytes([-1, 0x7, 0xe3, 0x39, 0xea, 0x9c, 0x37, 0x03, 0x56]),
        normalize({units: -568361657, billionths: -784795990}));
});

test("multiplyBytesExtended", t => {
    t.deepEqual(multiplyBytesExtended(
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0x90, 0x68, 0x8e, 0x25, 0x71, 0x28, 0x13, 0xeb]
    ), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    t.deepEqual(multiplyBytesExtended(
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [-1, 0x90, 0x68, 0x8e, 0x25, 0x71, 0x28, 0x13, 0xeb]
    ), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0, 0xd2, 0x14, 0xf6, 0x04, 0xf7]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 2],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x01, 0xa4, 0x29, 0xec, 0x09, 0xef]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 3],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x02, 0x76, 0x3e, 0xe2, 0x0e, 0xe6]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 5],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x04, 0x1a, 0x68, 0xce, 0x18, 0xd6]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 8],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x06, 0x90, 0xa7, 0xb0, 0x27, 0xbc]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0x10],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x0d, 0x21, 0x4f, 0x60, 0x4f, 0x79]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0x18],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x13, 0xb1, 0xf7, 0x10, 0x77, 0x36]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0x28],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x20, 0xd3, 0x46, 0x70, 0xc6, 0xb0]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0x40],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x34, 0x85, 0x3d, 0x81, 0x3d, 0xe7]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0x80],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x69, 0x0a, 0x7b, 0x02, 0x7b, 0xce]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0xc0],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0x9d, 0x8f, 0xb8, 0x83, 0xb9, 0xb5]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0, 0xff],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0xd1, 0x42, 0xe1, 0x0e, 0xf2, 0xa4]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0x01, 0x00],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0x01, 0x01],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0, 0xd2, 0xe7, 0x0a, 0xfa, 0xfc, 0x94]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0x01, 0x40],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0x01, 0x06, 0x9a, 0x33, 0x86, 0x35, 0x83]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0x01, 0xff],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0x01, 0xa3, 0x57, 0xd7, 0x13, 0xea, 0x41]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0, 0, 0, 0, 0, 0, 0x03, 0x00],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0, 0, 0, 0, 0, 0, 0x02, 0x76, 0x3e, 0xe2, 0x0e, 0xe6, 0xd5]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0x8f, 0x35, 0x98, 0xb6, 0x17, 0xfb, 0xab, 0x58],
        [1, 0xd2, 0x14, 0xf6, 0x04, 0xf7, 0x9c, 0x66, 0x1a],
    ), [1, 0x75, 0x85, 0xb1, 0x15, 0x95, 0xff, 0xe4, 0x3a, 0x6f, 0xd9, 0xbd, 0x1b, 0x07]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0x5a, 0x20, 0xbd, 0x38, 0x99, 0x60, 0x21, 0x31],
        [1, 0xb4, 0xfb, 0x8c, 0x5b, 0xcc, 0x08, 0x48, 0x97],
    ), [1, 0x3f, 0xb7, 0x94, 0x8f, 0x8b, 0x49, 0x30, 0xf3, 0x78, 0xe2, 0x85, 0x64, 0x96]);
    t.deepEqual(multiplyBytesExtended(
        [1, 0xb8, 0xf7, 0xdb, 0x0c, 0x90, 0x8a, 0x73, 0x84],
        [1, 0x06, 0x6f, 0xfe, 0x60, 0x47, 0x62, 0xf5, 0xb0],
    ), [1, 0x04, 0xa6, 0xba, 0x65, 0xc1, 0xb2, 0xc5, 0x03, 0x76, 0xb3, 0xa3, 0x81, 0xb4]);
});