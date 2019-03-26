import test from "ava";
import {normalize} from "./index";

test("normalize", t => {
    const {toString} = normalize({});
    t.deepEqual(normalize({}), {units: 0, billionths: 0, toString});
    t.deepEqual(normalize({units: 1}), {units: 1, billionths: 0, toString});
    t.deepEqual(normalize({billionths: 1}), {units: 0, billionths: 1, toString});
    t.deepEqual(normalize({units: 1, billionths: 1}), {units: 1, billionths: 1, toString});
    t.deepEqual(normalize({units: -1}), {units: -1, billionths: 0, toString});
    t.deepEqual(normalize({billionths: -1}), {units: 0, billionths: -1, toString});
    t.deepEqual(normalize({units: 1, billionths: -1}), {units: 0, billionths: 999999999, toString});
    t.deepEqual(normalize({units: -1, billionths: 1}), {units: 0, billionths: -999999999, toString});
    t.deepEqual(normalize({units: 1.1}), {units: 1, billionths: 100000000, toString});
    t.deepEqual(normalize({units: 1.1, billionths: 123456789}), {units: 1, billionths: 223456789, toString});
    t.deepEqual(normalize({units: -1.1}), {units: -1, billionths: -100000000, toString});
    t.deepEqual(normalize({units: -2, billionths: 1}), {units: -1, billionths: -999999999, toString});
    t.deepEqual(normalize({units: 1 / 0}), {units: 1 / 0, billionths: 1 / 0, toString});
    t.deepEqual(normalize({billionths: 1 / 0}), {units: 1 / 0, billionths: 1 / 0, toString});
    t.deepEqual(normalize({units: 1 / 0, billionths: 3}), {units: 1 / 0, billionths: 1 / 0, toString});
    t.deepEqual(normalize({units: 4, billionths: 1 / 0}), {units: 1 / 0, billionths: 1 / 0, toString});
    t.deepEqual(normalize({units: -1 / 0}), {units: -1 / 0, billionths: -1 / 0, toString});
    t.deepEqual(normalize({units: 6, billionths: -1 / 0}), {units: -1 / 0, billionths: -1 / 0, toString});
    t.deepEqual(normalize({units: -1 / 0, billionths: 1 / 0}), {units: -1 / 0, billionths: -1 / 0, toString});
    t.deepEqual(normalize({units: 0 / 0}), {units: 0 / 0, billionths: 0 / 0, toString});
    t.deepEqual(normalize({units: 0 / 0, billionths: 1}), {units: 0 / 0, billionths: 0 / 0, toString});
    t.deepEqual(normalize({units: 3, billionths: 0 / 0}), {units: 0 / 0, billionths: 0 / 0, toString});
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
    t.is(normalize({units: 1 / 0}).toString(), "Infinity");
    t.is(normalize({units: -1 / 0}).toString(), "-Infinity");
    t.is(normalize({units: 0 / 0}).toString(), "NaN");
});