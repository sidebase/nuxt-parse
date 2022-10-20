# nuxt-parse

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![GitHub stars](https://badgen.net/github/stars/sidebase/nuxt-parse)](https://GitHub.com/sidebase/nuxt-parse/)
[![License][license-src]][license-href]
[![Follow us on Twitter](https://badgen.net/badge/icon/twitter?icon=twitter&label)](https://twitter.com/sidebase_io)
[![Join our Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/9MUHR8WT9B)

A nuxt focused package to make data validation and parsing easy. This package follows the design philosophy of the article [parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). It uses [`zod`](https://github.com/colinhacks/zod) for parsing data from the user, APIs, your own functions, ...

Full tsdoc-documentation is here: https://nuxt-sidebase-parse.sidebase.io

[Moved here from original mono-repo](https://github.com/sidebase/sidebase-libs/tree/main/packages/nuxt-sidebase-parse)

## Features

- ✔️ Validate Data using [`zod`](https://github.com/colinhacks/zod)
- ✔️ Deserialize and Serialize user, backend, api data
- ✔️ Helpers focused on Nuxt 3 usage and developer experience

## Usage


```bash
npm i @sidebase/nuxt-parse
```

Then, e.g., in your code:

- Make an arbitrary parser, e.g., to deserialize data from an API:
    - Example with valid data:
        ```ts
        import { z, makeParser } from "@sidebase/nuxt-parse"

        // Define the expected response schema
        const responseSchema = z.object({
            uuid: z.string().uuid(),
        })

        // Perform the request, use `makeParse` to pass a transformer for the data
        const { data, error } = await useFetch('https://httpbin.org/uuid', {
            transform: makeParser(responseSchema),
        })

        console.log(`data is ${data.value}`)
        // -> `data is {"uuid":"f8df921c-d7f3-43c1-ac9b-3cf5d4da2f7b"}`

        console.log(`error is ${error.value}`)
        // -> `error is false`
        ```
    - Example with invalid data:
        ```ts
        import { z, makeParser } from "@sidebase/nuxt-parse"

        // Define the expected response schema
        const responseSchema = z.object({
            uuid: z.string().uuid(),
        })

        // Perform the request, use `makeParse` to pass a transformer for the data
        const { data, error } = await useFetch('https://httpbin.org/ip', {
            transform: makeParser(responseSchema),
        })

        console.log(`data is ${data.value}`)
        // -> `data is null`

        console.log(`error is ${error.value}`)
        // -> `error is true`
        ```
- Handle user data in an endpoint:
    ```ts
    import { defineEventHandler } from 'h3'
    import type { CompatibilityEvent } from 'h3'
    import { z, parseParamsAs, parseBodyAs } from "@sidebase/nuxt-parse"

    // Define the schema of the parameters you expect the user to provide you with
    const paramsSchema = z.object({
        id: z.string().uuid(),
    })

    // Define the schema of the body you expect the user to provide you with
    const bodySchema = z.object({
        name: z.string(),
        age: z.number()
    })

    // Get a nice type to use throughout your code and components
    type RequestBody = z.infer<typeof bodySchema>

    export default defineEventHandler(async (event: CompatibilityEvent) => {
        // Validate and then get the parameters
        // This automatically throws a nice HTTP 422 error with more information if the data is invalid
        const params = parseParamsAs(event, paramsSchema)

        let body: RequestBody;
        try {
            body = parseBodyAs(event, paramsSchema)
        } catch(error) {
            // Fallback, this avoids automatic raising + returning of the HTTP 422 error
            body = {
                name: 'Bernd',
                age: 88
            }
        }

        // Return the full entity
        return {
            id: params.id,
            ...body
        }
    })
    ```
- Parse any data:
    ```ts
    import { z, parseDataAs } from "@sidebase/nuxt-parse"

    const parsedData = await parseDataAs({ test: "1" }, z.object({ test: z.number() )}))
    // -> throws! `"1"` is not a number, but a string!

    const parsedData = await parseDataAs({ test: 1 }, z.object({ test: z.number() )}))
    console.log(parsedData)
    // -> output: `{ test: 1 }`


    const parsedData = await parseDataAs({ test: "1" }, z.object({ test: z.string().transform(v => parseInt(v)) )}))
    console.log(parsedData)
    // -> output: `{ test: 1 }` (we used `.transform` to ensure that we get a number)
    ```
- Also works with async data, e.g., when fetching from another API or DB:
    ```ts
    import { z, parseDataAs } from "@sidebase/nuxt-parse"

    const fakeDatabaseQuery = async () => { id: 1 }
    const parsedData = await parseDataAs(fakeDatabaseQuery, z.object({ id: z.number() )}))

    console.log(parsedData)
    // -> output: `1`
    ```

## Documentation

Full tsdoc-documentation is here: https://nuxt-sidebase-parse.sidebase.io

This module exports:
- `parseBodyAs`: Parse body of `h3` event
- `parseParamsAs`: Parse params of `h3` event
- `parseQueryAs`: Parse query of `h3` event
- `parseCookieAs`: Parse cookies of `h3` event
- `parseHeaderAs`: Parse header of `h3` event
- `parseDataAs`: Parse sync or async data
- `makeParser`: Make your own parser (see example above)
- `z`: [`zod`](https://github.com/colinhacks/zod), the library used for parsing


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@sidebase/nuxt-parse/latest.svg
[npm-version-href]: https://npmjs.com/package/@sidebase/nuxt-parse

[npm-downloads-src]: https://img.shields.io/npm/dt/@sidebase/nuxt-parse.svg
[npm-downloads-href]: https://npmjs.com/package/@sidebase/nuxt-parse

[license-src]: https://img.shields.io/npm/l/@sidebase/nuxt-parse.svg
[license-href]: https://npmjs.com/package/@sidebase/nuxt-parse

## Development

- Run `npm run test` to generate type stubs
- Run `npm run lint` to run eslint
- Run `npm run type` to run typescheck via tsc
- Run `npm publish` to run build and publish the package
