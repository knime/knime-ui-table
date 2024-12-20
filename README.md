# KNIME® UI Table

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=KNIME_knime-ui-table&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=KNIME_knime-ui-table)

This repository is maintained by the [KNIME UI Extensions Development Team](mailto:team-ui-extensions@knime.com).

This repository contains the table component used by e.g. the TableView of KNIME Analytics Platform and KNIME Hub. It is based on the [Vue] JavaScript framework.

It's published as npm package: [@knime/knime-ui-table]

## Development

### Prerequisites

- Install [Node.js][node], see version in [package.json](package.json).

Newer versions may also work, but have not been tested.

### Install dependencies

```sh
npm install
```

### Launch development server

```sh
npm run dev
```

or, using storybook:

```sh
npm run storybook
```

### Git hooks

When committing your changes, a couple of commit hooks will run via [husky].

- `pre-commit` hook to lint and format the changes in your stage zone (via [lintstaged])
- `prepare-commit-msg` hook to format your commit message to conform with the required format by KNIME. In order for this to work you must set environment variables with your Atlassian email and API token. Refer to `@knime/eslint-config/scripts/README.md` for more information.

### Testing

#### Running unit tests

This project contains unit tests based on [Vitest].
They are run with

```sh
npm run test:unit
```

You can generate a coverage report with

```sh
npm run coverage
```

The output can be found in the `coverage` folder. It contains a browseable html report as well as raw coverage data in
[LCOV] and [Clover] format, which can be used in analysis software (SonarQube, Jenkins, …).

### Running security audit

npm provides a check against known security issues of used dependencies. Run it by calling

```sh
npm run audit
```

### Logging

You can log using the global `consola` variable (which the embedding application needs to provide).

See https://github.com/nuxt/consola for details.

## Building

To build the table component as [Vue library], use the following command:

```sh
npm run build
```

Results are saved to `/dist`.

## Publishing

Once a pull request was created and the BitBucket pipeline built successfully, make sure to hit the "Deploy" button responsible for "publish patch version to npm". This will automatically create an extra version bump commit which must be included when finally merging the pull request to `master`.

## Using the KNIME-Table in a Vue application

Install [@knime/knime-ui-table] npm package as dependency:

```sh
npm i @knime/knime-ui-table
```

```js
import { Table } from "@knime/knime-ui-table";

export default {
  // ...
  components: {
    Table,
  },
  // ...
};
```

Use in Template

```xml
<template>
  <Table />
</template>
```

### Requirements

The KNIME-Table expects that the embedding app provides the following:

- Vue and Consola compatible to the versions defined in [`package.json`](package.json)

[Vue]: https://vuejs.org/
[node]: https://knime-com.atlassian.net/wiki/spaces/SPECS/pages/905281540/Node.js+Installation
[Vue library]: https://vitejs.dev/guide/build.html#library-mode
[Vitest]: https://vitest.dev/
[lcov]: https://github.com/linux-test-project/lcov
[clover]: http://openclover.org/
[@knime/knime-ui-table]: https://www.npmjs.com/package/@knime/knime-ui-table
[husky]: https://www.npmjs.com/package/husky
[lintstaged]: https://github.com/okonet/lint-staged
