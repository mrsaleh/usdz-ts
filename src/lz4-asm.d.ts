declare module "lz4-asm"{
    interface LZ4Events{
        ready:Promise<LZ4Object>;
    }

    interface LZ4Object{
        lz4js:object;
    }

    export function lz4init():LZ4Events;
}

