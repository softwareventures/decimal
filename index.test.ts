import test from "ava";
import {add, normalize} from "./index";

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