// See https://github.com/apollographql/graphql-tag/issues/59#issuecomment-316991007
// for why this is here
// tl;dr This ensures that importing .graphql files in TypeScript works correctly
declare module "*.graphql" {
    import {DocumentNode} from "graphql";

    const value: DocumentNode;
    export = value;
}
