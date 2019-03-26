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
});