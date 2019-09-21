import {Comparison} from "@softwareventures/ordered";
import test from "ava";
import {
    add,
    compare,
    equal,
    format,
    formatFixed,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    max,
    min,
    multiply,
    normalize,
    notEqual,
    round,
    subtract,
    toThousandths
} from ".";
import {fromThousandths} from "./index";

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
    t.deepEqual(multiply(0, {billionths: 13655}), normalize(0));
    t.deepEqual(multiply(0, {billionths: 4041474048}), normalize(0));
    t.deepEqual(multiply(0, {units: 2759}), normalize(0));
    t.deepEqual(multiply(0, {units: 1573322752}), normalize(0));
    t.deepEqual(multiply({billionths: 2124}, 0), normalize(0));
    t.deepEqual(multiply({billionths: 44834}, {billionths: 4259}), normalize(0));
    t.deepEqual(multiply({billionths: 65535}, {billionths: 65535}), normalize({billionths: 4}));
    t.deepEqual(multiply({billionths: 23897}, {billionths: 715456512}), normalize({billionths: 17097}));
    t.deepEqual(multiply({billionths: 23898}, {billionths: 715456512}), normalize({billionths: 17098}));
    t.deepEqual(multiply({billionths: 24221}, {units: 6440}), normalize({billionths: 155983240}));
    t.deepEqual(multiply({billionths: 13137}, {units: 644953600}), normalize({units: 8472, billionths: 755443200}));
    t.deepEqual(multiply({billionths: 951910400}, 0), normalize(0));
    t.deepEqual(multiply({billionths: 503447552}, {billionths: 33662}), normalize({billionths: 16947}));
    t.deepEqual(multiply({billionths: 395509760}, {billionths: 512360448}), normalize({billionths: 202643558}));
    t.deepEqual(multiply({billionths: 202833920}, {units: 17273}), normalize({units: 3503, billionths: 550300160}));
    t.deepEqual(multiply({billionths: 287440896}, {units: 1011417088}),
        normalize({units: 290722634, billionths: 4430848}));
    t.deepEqual(multiply({units: 28248}, 0), normalize(0));
    t.deepEqual(multiply({units: 15815}, {billionths: 53207}), normalize({billionths: 841468705}));
    t.deepEqual(multiply({units: 22149}, {billionths: 465305600}), normalize({units: 10306, billionths: 53734400}));
    t.deepEqual(multiply({units: 63274}, {units: 26681}), normalize({units: 688213594}));
    t.deepEqual(multiply({units: 17196}, {units: 258422272}), normalize({units: 829389312}));
    t.deepEqual(multiply({units: 2486829056}, 0), normalize(0));
    t.deepEqual(multiply({units: 517865472}, {billionths: 63370}), normalize({units: 32817, billionths: 134960640}));
    t.deepEqual(multiply({units: 154533888}, {billionths: 816709632}),
        normalize({units: 126209314, billionths: 800009216}));
    t.deepEqual(multiply({units: 922091520}, {units: 4561}), normalize({units: 659422720}));
    t.deepEqual(multiply({units: 533266432}, {units: 642646016}), normalize({units: 991334912}));
    t.deepEqual(multiply(0, {billionths: -13655}), normalize(0));
    t.deepEqual(multiply(0, {billionths: -4041474048}), normalize(0));
    t.deepEqual(multiply(0, {units: -2759}), normalize(0));
    t.deepEqual(multiply(0, {units: -1573322752}), normalize(0));
    t.deepEqual(multiply({billionths: 44834}, {billionths: -4259}), normalize(0));
    t.deepEqual(multiply({billionths: 65535}, {billionths: -65535}), normalize({billionths: -4}));
    t.deepEqual(multiply({billionths: 23897}, {billionths: -715456512}), normalize({billionths: -17097}));
    t.deepEqual(multiply({billionths: 23898}, {billionths: -715456512}), normalize({billionths: -17098}));
    t.deepEqual(multiply({billionths: 24221}, {units: -6440}), normalize({billionths: -155983240}));
    t.deepEqual(multiply({billionths: 13137}, {units: -1644953600}),
        normalize({units: -21609, billionths: -755443200}));
    t.deepEqual(multiply({billionths: 503447552}, {billionths: -33662}), normalize({billionths: -16947}));
    t.deepEqual(multiply({billionths: 395509760}, {billionths: -512360448}), normalize({billionths: -202643558}));
    t.deepEqual(multiply({billionths: 202833920}, {units: -17273}),
        normalize({units: -3503, billionths: -550300160}));
    t.deepEqual(multiply({billionths: 287440896}, {units: -11417088}),
        normalize({units: -3281738, billionths: -4430848}));
    t.deepEqual(multiply({units: 15815}, {billionths: -53207}), normalize({billionths: -841468705}));
    t.deepEqual(multiply({units: 22149}, {billionths: -465305600}),
        normalize({units: -10306, billionths: -53734400}));
    t.deepEqual(multiply({units: 63274}, {units: -26681}), normalize({units: -688213594}));
    t.deepEqual(multiply({units: 17196}, {units: -258422272}), normalize({units: -829389312}));
    t.deepEqual(multiply({units: 517865472}, {billionths: -63370}),
        normalize({units: -32817, billionths: -134960640}));
    t.deepEqual(multiply({units: 154533888}, {billionths: -816709632}),
        normalize({units: -126209314, billionths: -800009216}));
    t.deepEqual(multiply({units: 922091520}, {units: -4561}), normalize({units: -659422720}));
    t.deepEqual(multiply({units: 533266432}, {units: -642646016}), normalize(-991334912));
    t.deepEqual(multiply(123, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply(0, {units: 123, billionths: 456789}), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply({units: -3456, billionths: -8765}, 0), normalize({units: 0, billionths: 0}));
    t.deepEqual(multiply({billionths: 32396}, {billionths: 7436}), normalize(0));
    t.deepEqual(multiply({billionths: 32397}, {billionths: 7436}), normalize(0));
    t.deepEqual(multiply({billionths: 32396}, {billionths: 567869440}), normalize({billionths: 18397}));
    t.deepEqual(multiply({billionths: 32397}, {billionths: 567869440}), normalize({billionths: 18397}));
    t.deepEqual(multiply({billionths: 32396}, {billionths: 567876876}), normalize({billionths: 18397}));
    t.deepEqual(multiply({billionths: 32397}, {billionths: 567876876}), normalize({billionths: 18398}));
    t.deepEqual(multiply({billionths: 878641152}, {billionths: 7436}), normalize({billionths: 6534}));
    t.deepEqual(multiply({billionths: 878641152}, {billionths: 567869440}), normalize({billionths: 498953459}));
    t.deepEqual(multiply({billionths: 878673548}, {billionths: 7436}), normalize({billionths: 6534}));
    t.deepEqual(multiply({billionths: 878673549}, {billionths: 7436}), normalize({billionths: 6534}));
    t.deepEqual(multiply({billionths: 878673548}, {billionths: 567869440}), normalize({billionths: 498971856}));
    t.deepEqual(multiply({billionths: 878673549}, {billionths: 567869440}), normalize({billionths: 498971856}));
    t.deepEqual(multiply({billionths: 878673548}, {billionths: 567876876}), normalize({billionths: 498978389}));
    t.deepEqual(multiply({billionths: 878673549}, {billionths: 567876876}), normalize({billionths: 498978390}));
    t.deepEqual(multiply({billionths: 878673550}, {billionths: 567876876}), normalize({billionths: 498978391}));
    t.deepEqual(multiply({billionths: 878673551}, {billionths: 567876876}), normalize({billionths: 498978391}));
    t.deepEqual(multiply({billionths: 878673552}, {billionths: 567876876}), normalize({billionths: 498978392}));
    t.deepEqual(multiply({billionths: 878673553}, {billionths: 567876876}), normalize({billionths: 498978392}));
    t.deepEqual(multiply({units: 35782, billionths: 876567876}, {units: 55676, billionths: 554567865}),
        normalize({units: 992267279, billionths: 826525982}));
    t.deepEqual(multiply({units: 35783, billionths: 876567876}, {units: 55676, billionths: 554567865}),
        normalize({units: 992322956, billionths: 381093847}));
    t.deepEqual(multiply({units: 35783, billionths: 876567877}, {units: 55676, billionths: 554567865}),
        normalize({units: 992322956, billionths: 381149523}));
    t.deepEqual(multiply({units: 35783, billionths: 876567878}, {units: 55676, billionths: 554567865}),
        normalize({units: 992322956, billionths: 381205200}));
    t.deepEqual(multiply({units: 35783, billionths: 876567879}, {units: 55676, billionths: 554567865}),
        normalize({units: 992322956, billionths: 381260876}));
    t.deepEqual(multiply({units: 35783, billionths: 876567880}, {units: 55676, billionths: 554567865}),
        normalize({units: 992322956, billionths: 381316553}));
    t.deepEqual(multiply({units: 35783, billionths: 876567880}, {units: 55676, billionths: 876567876}),
        normalize({units: 992334478, billionths: 789965033}));
    t.deepEqual(multiply({units: 35783, billionths: 876567881}, {units: 55676, billionths: 876567876}),
        normalize({units: 992334478, billionths: 790020710}));
    t.deepEqual(multiply({units: 35783, billionths: 876567882}, {units: 55676, billionths: 876567876}),
        normalize({units: 992334478, billionths: 790076386}));
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

test("toThousandths", t => {
    t.deepEqual(toThousandths({}), [0, 0, 0, 0, 0, 0]);
    t.deepEqual(toThousandths({billionths: 1}), [0, 0, 0, 0, 0, 1]);
    t.deepEqual(toThousandths({billionths: -1}), [0, 0, 0, 0, 0, -1]);
    t.deepEqual(toThousandths({units: 1}), [0, 0, 1, 0, 0, 0]);
    t.deepEqual(toThousandths({units: -1}), [0, 0, -1, 0, 0, 0]);
    t.deepEqual(toThousandths({units: 123456789, billionths: 987654321}), [123, 456, 789, 987, 654, 321]);
    t.deepEqual(toThousandths({units: -123456789, billionths: -987654321}), [-123, -456, -789, -987, -654, -321]);
});

test("fromThousandths", t => {
    t.deepEqual(fromThousandths([0, 0, 0, 0, 0, 0]), normalize({units: 0, billionths: 0}));
    t.deepEqual(fromThousandths([0, 0, 0, 0, 0, 1]), normalize({units: 0, billionths: 1}));
    t.deepEqual(fromThousandths([0, 0, 0, 0, 0, -1]), normalize({units: 0, billionths: -1}));
    t.deepEqual(fromThousandths([0, 0, 1, 0, 0, 0]), normalize({units: 1, billionths: 0}));
    t.deepEqual(fromThousandths([0, 0, -1, 0, 0, 0]), normalize({units: -1, billionths: 0}));
    t.deepEqual(fromThousandths([123, 456, 789, 987, 654, 321]), normalize({units: 123456789, billionths: 987654321}));
    t.deepEqual(fromThousandths([-123, -456, -789, -987, -654, -321]),
        normalize({units: -123456789, billionths: -987654321}));
});