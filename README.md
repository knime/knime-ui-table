# KNIME-Table for KNIME® Analytics Platform & WebPortal

This repository contains the table component used by the WebPortal and by the Table view for the Analytics Platform. It is based on the [Vue] JavaScript framework.
The knime-ui-table repository is included into those projects as a git submodule.
It itself uses webapps-common as submodule.

## Development

### Prerequisites

- Install [Node.js **Version 14**][node].
- Only for test coverage uploads to SonarQube: you also need [Java]™ 8 or 11.

Newer versions may also work, but have not been tested.

Pull the contained [git submodules](https://stackoverflow.com/a/4438292/5134084) with

```sh
git submodule update --init
```

### Install dependencies

```sh
npm install
```

and then use the following commands. For detailed explanations see [Vue CLI docs]:

### Launch development server

Compiles all JavaScript sources, assets, … and starts a local web server with a demo app for development.
Includes hot-reloading, so code changes will be visible in the browser immediately.

```sh
npm run demo
```

### Testing

#### Running unit tests

This project contains unit tests written with [jest].
They are run with

```sh
npm run test:unit
```

During development, you can use `npm run test:unit -- --watch` to have the unit tests run automatically whenever a
source file changes.

You can generate a coverage report with

```sh
npm run coverage
```

The output can be found in the `coverage` folder. It contains a browseable html report as well as raw coverage data in
[LCOV] and [Clover] format, which can be used in analysis software (SonarQube, Jenkins, …).

### Running security audit

npm provides a check against known security issues of used dependencies. Run it by calling

```sh
npm audit
```

### Logging

You can log using the global `consola` variable (which the embedding application needs to provide).

See https://github.com/nuxt/consola for details.

## Building

To build the PageBuilder as [Vue library], use the following command:

```sh
npm run build
```

Results are saved to `/dist`.

## Embedding the KNIME-Table in your Vue application

```js
import { Table } from "knime-ui-table";

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
- global `window.Vue` object
- global `window.consola` instance for logging

[vue]: https://vuejs.org/
[vue cli docs]: https://cli.vuejs.org/guide/
[vue library]: https://cli.vuejs.org/guide/build-targets.html#library
[jest]: https://jestjs.io/en
[lcov]: https://github.com/linux-test-project/lcov
[clover]: http://openclover.org/
