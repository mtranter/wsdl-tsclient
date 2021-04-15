import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../../src";
import { Logger } from "../../../src/utils/logger";

const target = "recursive/A";

test(target, async t => {
    Logger.disabled();

    const input = `./test/resources/${target}.xsd`;
    const outdir = "./test/generated/recursive";

    t.test(`${target} - generate wsdl client`, async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    // t.test(`${target} - check definitions`, async t => {
    //     t.equal(existsSync(`${outdir}/A/definitions/BankSvcRq.ts`), true);
    //     t.equal(existsSync(`${outdir}/A/definitions/BankSvcRs.ts`), true);
    //     t.equal(existsSync(`${outdir}/A/definitions/ARq.ts`), true);
    //     t.equal(existsSync(`${outdir}/A/definitions/ARs.ts`), true);
    //     t.equal(existsSync(`${outdir}/A/definitions/PaymentRq.ts`), true);
    //     t.equal(existsSync(`${outdir}/A/definitions/PaymentRs.ts`), true);
    //     t.end();
    // });

});