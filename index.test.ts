import {Comparison} from "@softwareventures/ordered";
import test from "ava";
import {
    add,
    compare,
    equal,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    multiply,
    normalize,
    notEqual,
    subtract
} from "./index";

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
    t.is(normalize({}).toString(), "0");
    t.is(normalize({units: 1}).toString(), "1");
    t.is(normalize({billionths: 1}).toString(), "0.000000001");
    t.is(normalize({billionths: 21}).toString(), "0.000000021");
    t.is(normalize({billionths: 30}).toString(), "0.00000003");
    t.is(normalize({units: 1, billionths: 1}).toString(), "1.000000001");
    t.is(normalize({units: -1}).toString(), "-1");
    t.is(normalize({billionths: -1}).toString(), "-0.000000001");
    t.is(normalize({units: 1, billionths: -1}).toString(), "0.999999999");
    t.is(normalize({units: -1, billionths: 1}).toString(), "-0.999999999");
    t.is(normalize({units: 1, billionths: 100000000}).toString(), "1.1");
    t.is(normalize({units: 2, billionths: 340000000}).toString(), "2.34");
    t.is(normalize({units: 1 / 0}).toString(), "0");
    t.is(normalize({units: -1 / 0}).toString(), "0");
    t.is(normalize({units: 0 / 0}).toString(), "0");
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
    t.deepEqual(multiply(123, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply(0, {units: 123, billionths: 456789}), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply({units: -3456, billionths: -8765}, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply({billionths: 878673548}, {billionths: 567876876}), normalize({billionths: 498978389}));
    t.deepEqual(multiply({billionths: 878673549}, {billionths: 567876876}), normalize({billionths: 498978390}));
    t.deepEqual(multiply({billionths: 878673550}, {billionths: 567876876}), normalize({billionths: 498978391}));
    t.deepEqual(multiply({billionths: 878673551}, {billionths: 567876876}), normalize({billionths: 498978391}));
    t.deepEqual(multiply({billionths: 878673552}, {billionths: 567876876}), normalize({billionths: 498978392}));
    t.deepEqual(multiply({billionths: 878673553}, {billionths: 567876876}), normalize({billionths: 498978392}));
});

test.failing("multiply high precision", t => {
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