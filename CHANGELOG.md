# Changelog

## [0.8.1](https://github.com/eslint/css/compare/css-v0.8.0...css-v0.8.1) (2025-05-16)


### Bug Fixes

* improve use-baseline types regex ([#137](https://github.com/eslint/css/issues/137)) ([5ed6073](https://github.com/eslint/css/commit/5ed607360960f2acf83f8e322fd9016ec125ea38))

## [0.8.0](https://github.com/eslint/css/compare/css-v0.7.0...css-v0.8.0) (2025-05-15)


### Features

* add no-important rule ([#124](https://github.com/eslint/css/issues/124)) ([af043db](https://github.com/eslint/css/commit/af043dbc3359bdd7f2b92e963be630d5141684d7))
* allow custom descriptors in no-invalid-at-rules ([#128](https://github.com/eslint/css/issues/128)) ([df26df3](https://github.com/eslint/css/commit/df26df32f9cd93867a22f4939d1b8cac13e28d6b))
* Update Baseline data ([#130](https://github.com/eslint/css/issues/130)) ([86aad6b](https://github.com/eslint/css/commit/86aad6b7b7b26135af18996c5d26d0a750dbaac2))


### Bug Fixes

* remove redundant `Comment` member from `CSSSyntaxElement` union ([#119](https://github.com/eslint/css/issues/119)) ([67f3d4e](https://github.com/eslint/css/commit/67f3d4e7c442be9cc96a83824a67efeea81a2e85))

## [0.7.0](https://github.com/eslint/css/compare/css-v0.6.0...css-v0.7.0) (2025-04-16)


### Features

* Type checking for all APIs and rules ([#103](https://github.com/eslint/css/issues/103)) ([809ea4c](https://github.com/eslint/css/commit/809ea4c546aaae63f159df9031beeba8cb697d47))


### Bug Fixes

* Set use-baseline to 'warn' in recommended config ([#110](https://github.com/eslint/css/issues/110)) ([2152e9d](https://github.com/eslint/css/commit/2152e9d4981b4920254296cd261d5839558484e7)), closes [#80](https://github.com/eslint/css/issues/80)

## [0.6.0](https://github.com/eslint/css/compare/css-v0.5.0...css-v0.6.0) (2025-03-26)


### ⚠ BREAKING CHANGES

* Rename require-baseline -> use-baseline ([#100](https://github.com/eslint/css/issues/100))

### Features

* CSS nesting baseline support ([#87](https://github.com/eslint/css/issues/87)) ([8fcae6c](https://github.com/eslint/css/commit/8fcae6c17e85809f507c8efbec6d158725f89221))
* Rename require-basline -&gt; use-baseline ([#100](https://github.com/eslint/css/issues/100)) ([21b71b4](https://github.com/eslint/css/commit/21b71b4c3fdb283dc0eb0e3d304e3ec7194578f8)), closes [#96](https://github.com/eslint/css/issues/96)


### Bug Fixes

* Add support period-separated layer names in use-layers rule ([#92](https://github.com/eslint/css/issues/92)) ([54b7da5](https://github.com/eslint/css/commit/54b7da55e39b65a1b2c3ccc793c25b1fef8f2929))
* Catch more parse errors ([#97](https://github.com/eslint/css/issues/97)) ([d08df74](https://github.com/eslint/css/commit/d08df74ac48d34557ebc6f976418ac9d555e9dec))
* compute baseline status of individual features ([#82](https://github.com/eslint/css/issues/82)) ([3d91042](https://github.com/eslint/css/commit/3d910420ce8c6d3923b3256224406902cc721d59))
* Don't check class names in require-baseline ([#93](https://github.com/eslint/css/issues/93)) ([b8d6356](https://github.com/eslint/css/commit/b8d6356f4bf42ff74affcf26bbfb8487b7c26e3d))
* expand supported types in baseline-data ([#74](https://github.com/eslint/css/issues/74)) ([96c3f95](https://github.com/eslint/css/commit/96c3f957c9f7a5f8c676693a50ea9b58e7e93d9a))

## [0.5.0](https://github.com/eslint/css/compare/css-v0.4.0...css-v0.5.0) (2025-03-14)


### Features

* add prefer-logical-properties rule ([#63](https://github.com/eslint/css/issues/63)) ([2a440ce](https://github.com/eslint/css/commit/2a440ce617cc6754563bc8c41ae16dfd445a0b95))
* add selector support to require-baseline ([#61](https://github.com/eslint/css/issues/61)) ([9c7fd6a](https://github.com/eslint/css/commit/9c7fd6aa06b62c70d979ff5f7b9c06a95fdeed56))
* add support for baseline years ([#81](https://github.com/eslint/css/issues/81)) ([4c70882](https://github.com/eslint/css/commit/4c70882fb3e3752f1b3153c190c767386d61cb95))
* Switch to @eslint/css-tree ([#83](https://github.com/eslint/css/issues/83)) ([828a6eb](https://github.com/eslint/css/commit/828a6eb9b32063c58395583a090a723f7a287481))

## [0.4.0](https://github.com/eslint/css/compare/css-v0.3.0...css-v0.4.0) (2025-02-19)


### Features

* Add support for media conditions in require-baseline rule ([#49](https://github.com/eslint/css/issues/49)) ([ad9ddd7](https://github.com/eslint/css/commit/ad9ddd769b38ba26f09c1a76c0da80d5144dff53))


### Bug Fixes

* require-baseline should not warn for cursor property ([#52](https://github.com/eslint/css/issues/52)) ([21b5aad](https://github.com/eslint/css/commit/21b5aadb11e1426baa8bc6325f65c34345ee40f5)), closes [#51](https://github.com/eslint/css/issues/51)

## [0.3.0](https://github.com/eslint/css/compare/css-v0.2.0...css-v0.3.0) (2025-02-14)


### Features

* Add use-layers rule ([#27](https://github.com/eslint/css/issues/27)) ([6ebf57e](https://github.com/eslint/css/commit/6ebf57e6153f5bdc57b362e86942fee5184c2d73))
* Allow custom syntax ([#47](https://github.com/eslint/css/issues/47)) ([397888b](https://github.com/eslint/css/commit/397888b4749d56ca5937d87b0161fecc7acfc734))
* require-baseline rule ([#33](https://github.com/eslint/css/issues/33)) ([c5f66fa](https://github.com/eslint/css/commit/c5f66fa16d754860f579884a1b50686094fe28b1))


### Bug Fixes

* make types usable in CommonJS ([#44](https://github.com/eslint/css/issues/44)) ([0540006](https://github.com/eslint/css/commit/05400062cb593d3a0cf941bdd4abd4e705f96e01))
* Suppress var() validation errors ([#45](https://github.com/eslint/css/issues/45)) ([f526b1d](https://github.com/eslint/css/commit/f526b1dcdbfb451ad9783e0cca3c58621138bad1)), closes [#40](https://github.com/eslint/css/issues/40)

## [0.2.0](https://github.com/eslint/css/compare/css-v0.1.0...css-v0.2.0) (2025-01-07)


### Features

* Add tolerant parsing mode ([#38](https://github.com/eslint/css/issues/38)) ([9e4b2dd](https://github.com/eslint/css/commit/9e4b2dd5ae44715ad98677b3c44ccb54a3a4fe1f)), closes [#29](https://github.com/eslint/css/issues/29)


### Bug Fixes

* add type tests ([#16](https://github.com/eslint/css/issues/16)) ([f21e090](https://github.com/eslint/css/commit/f21e090cca76a85bf6b6c89c8797c79f28d5a163))

## 0.1.0 (2024-11-26)


### Features

* Add no-duplicate-imports rule ([#4](https://github.com/eslint/css/issues/4)) ([8d4558b](https://github.com/eslint/css/commit/8d4558bbbd6134d5bba4c0b4130f7be31de1b34a))
* CSS language plugin ([#2](https://github.com/eslint/css/issues/2)) ([52d4f2c](https://github.com/eslint/css/commit/52d4f2c35c8a164a8f95b03ec7709abe6a8e59e8))
* no-invalid-properties rule ([#11](https://github.com/eslint/css/issues/11)) ([9b80bdd](https://github.com/eslint/css/commit/9b80bdd5e222b158fd94dbef9ca6add92dd2a5ce))
* no-unknown-at-rules -&gt; no-invalid-at-rules ([#12](https://github.com/eslint/css/issues/12)) ([b90ee0e](https://github.com/eslint/css/commit/b90ee0eb86691747040f48f92afb19f6a18d2231))
* no-unknown-at-rules rule ([#7](https://github.com/eslint/css/issues/7)) ([9a4d027](https://github.com/eslint/css/commit/9a4d02721a8f7f5d1f119337a45fb4336ee69156))
* no-unknown-properties rule ([#5](https://github.com/eslint/css/issues/5)) ([43dec96](https://github.com/eslint/css/commit/43dec96553557be58039a658e0bb100cd6ae2ab8))
