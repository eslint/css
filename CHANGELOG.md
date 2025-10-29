# Changelog

## [0.14.0](https://github.com/eslint/css/compare/css-v0.13.0...css-v0.14.0) (2025-10-29)


### Features

* add `allow*` options to `use-baseline` rule ([#310](https://github.com/eslint/css/issues/310)) ([e8dc57d](https://github.com/eslint/css/commit/e8dc57d91828150f8221de48065993c6478e02ca))
* add `no-unmatchable-selectors` rule ([#301](https://github.com/eslint/css/issues/301)) ([adaa397](https://github.com/eslint/css/commit/adaa397db27c518d04bc2218f8a44dc088e06ddb))


### Bug Fixes

* correct message for functions in `use-baseline` rule ([#297](https://github.com/eslint/css/issues/297)) ([cc0dff7](https://github.com/eslint/css/commit/cc0dff76da0eb1e6c05c31cd8aecf3b6afa5bd0d))
* disallow extra properties in rule options ([#299](https://github.com/eslint/css/issues/299)) ([baf36e2](https://github.com/eslint/css/commit/baf36e26728b512b32a6220f50183757ebbc9056))
* enforce valid `allow*` values in `prefer-logical-properties` rule ([#311](https://github.com/eslint/css/issues/311)) ([23caee3](https://github.com/eslint/css/commit/23caee38eef8231e2bbdd4c2c651e0645440b85a))
* update baseline data ([#296](https://github.com/eslint/css/issues/296)) ([0f6725f](https://github.com/eslint/css/commit/0f6725f17a97273b97ca62b2d25cee5ca212df83))
* update baseline data ([#306](https://github.com/eslint/css/issues/306)) ([2f44739](https://github.com/eslint/css/commit/2f4473972a64eb18e64ae997cff8e45718a81b18))

## [0.13.0](https://github.com/eslint/css/compare/css-v0.12.0...css-v0.13.0) (2025-10-10)


### Features

* add `selector-complexity` rule ([#252](https://github.com/eslint/css/issues/252)) ([2bd29c4](https://github.com/eslint/css/commit/2bd29c4ff0dcd145e0f5c0a63a64d70f31ab90df))


### Bug Fixes

* handle missing declaration state in `no-invalid-properties` ([#290](https://github.com/eslint/css/issues/290)) ([4120774](https://github.com/eslint/css/commit/4120774e7e641ea8f6d34a70a39c0969c71ba33d))

## [0.12.0](https://github.com/eslint/css/compare/css-v0.11.1...css-v0.12.0) (2025-10-06)


### Features

* add support for `getLocFromIndex` and `getIndexFromLoc` ([#167](https://github.com/eslint/css/issues/167)) ([3baeacf](https://github.com/eslint/css/commit/3baeacfe806a39763bbb63106a2fd750d2e407a1))


### Bug Fixes

* correct location reporting for `!important` in `no-important` rule ([#286](https://github.com/eslint/css/issues/286)) ([33ea905](https://github.com/eslint/css/commit/33ea9056be5946894be35616cb95662ec6aad4b2))
* correct the return type of `applyInlineConfig` ([#281](https://github.com/eslint/css/issues/281)) ([386f42a](https://github.com/eslint/css/commit/386f42a1f40c1abb59090d48750d18ffe72917fe))
* handle all CSS newline types in `CSSSourceCode` ([#275](https://github.com/eslint/css/issues/275)) ([2d0eec6](https://github.com/eslint/css/commit/2d0eec6ae06bd8561ed27d5912066278f763ad01))
* handle all CSS newlines in rules ([#280](https://github.com/eslint/css/issues/280)) ([ed0c0f1](https://github.com/eslint/css/commit/ed0c0f135540781439bd12216583f5cd7d1ff0e4))
* no-invalid-properties false positives for var() in functions ([#227](https://github.com/eslint/css/issues/227)) ([268c7f0](https://github.com/eslint/css/commit/268c7f03b981025e97c1489848212b5e9a27a9ab))
* update baseline data ([fb65800](https://github.com/eslint/css/commit/fb658009ef6d92e1ad11c0ae9d57ba5c20e67f55))
* update baseline data ([#287](https://github.com/eslint/css/issues/287)) ([73734bb](https://github.com/eslint/css/commit/73734bb9f6b756d5f993b5b0b13c455d9e39f70d))

## [0.11.1](https://github.com/eslint/css/compare/css-v0.11.0...css-v0.11.1) (2025-09-22)


### Bug Fixes

* detect prefixed [@keyframes](https://github.com/keyframes) in no-duplicate-keyframe-selectors ([11ae50f](https://github.com/eslint/css/commit/11ae50fb404d1620309921ebadec006498db4091))
* detect prefixed `[@keyframes](https://github.com/keyframes)` in `no-duplicate-keyframe-selectors` ([#251](https://github.com/eslint/css/issues/251)) ([11ae50f](https://github.com/eslint/css/commit/11ae50fb404d1620309921ebadec006498db4091))
* Ensure languageOptions.customSyntax is serializable ([#212](https://github.com/eslint/css/issues/212)) ([7f82110](https://github.com/eslint/css/commit/7f82110ea633e1524d083434468052a7942c7236))
* update baseline data ([#245](https://github.com/eslint/css/issues/245)) ([a009bb7](https://github.com/eslint/css/commit/a009bb7ce58a29de9063bf4059ef217261449bd2))
* update baseline data ([#254](https://github.com/eslint/css/issues/254)) ([ff77374](https://github.com/eslint/css/commit/ff773743c8397d509bf215aa743abb28b92b94f5))
* update baseline data ([#257](https://github.com/eslint/css/issues/257)) ([b5414d3](https://github.com/eslint/css/commit/b5414d3e4bbcac9fd27bcc3c220d1b50aa86e8b3))
* update baseline data ([#267](https://github.com/eslint/css/issues/267)) ([da37950](https://github.com/eslint/css/commit/da3795005f9b1492c056f5c6950eb7c3252fb4d8))

## [0.11.0](https://github.com/eslint/css/compare/css-v0.10.0...css-v0.11.0) (2025-08-28)


### Features

* add [@namespace](https://github.com/namespace) validation to no-invalid-at-rule-placement rule ([#183](https://github.com/eslint/css/issues/183)) ([26b902c](https://github.com/eslint/css/commit/26b902c4f42cccb33d7f8119a3376773e0ad91bd))
* add `font-family-fallbacks` rule ([#174](https://github.com/eslint/css/issues/174)) ([5678024](https://github.com/eslint/css/commit/5678024802af61fff74e71172a3732c5deec7afe))
* add allow-list options for at-rules, properties, and selectors ([#228](https://github.com/eslint/css/issues/228)) ([623ad8e](https://github.com/eslint/css/commit/623ad8efeee114bc8f2cc814ca9656f560447745))
* add autofix to no-duplicate-imports rule ([#216](https://github.com/eslint/css/issues/216)) ([0aa7b97](https://github.com/eslint/css/commit/0aa7b977a1ab829698ab40de906be5a2935945a5))
* add new rule `no-duplicate-keyframe-selectors` ([#143](https://github.com/eslint/css/issues/143)) ([dfe9c05](https://github.com/eslint/css/commit/dfe9c051907a49ccf58cf4c7b14fea1324fc5ab5))
* add suggestion to no-important rule to remove !important flag ([#217](https://github.com/eslint/css/issues/217)) ([47e26b3](https://github.com/eslint/css/commit/47e26b3a83d18390dc87df718359225b20bd65d9))
* allow relative-size and global values in relative-font-units ([#214](https://github.com/eslint/css/issues/214)) ([933d71c](https://github.com/eslint/css/commit/933d71c61ca3ae5eb97474df8cc9f94a13a9a273))
* make var() regex multiline-safe in `no-invalid-properties` ([#242](https://github.com/eslint/css/issues/242)) ([c123f6e](https://github.com/eslint/css/commit/c123f6e89bbeb512adb02237a3e81be20e607e46))


### Bug Fixes

* allow any type for `meta.docs.recommended` in custom rules ([#231](https://github.com/eslint/css/issues/231)) ([6ea61a5](https://github.com/eslint/css/commit/6ea61a5aef4582c9ae64f7428b50d9722a717acb))
* bump `plugin-kit` to latest to resolve security vulnerabilities ([#209](https://github.com/eslint/css/issues/209)) ([32e02d6](https://github.com/eslint/css/commit/32e02d6c1425caefa83a98ef868364b734339241))
* disallow extra properties in rule options ([#197](https://github.com/eslint/css/issues/197)) ([8fd755d](https://github.com/eslint/css/commit/8fd755d132b08105838ac032654a3be906fe44ca))
* enforce strict syntax for `[@charset](https://github.com/charset)` in no-invalid-at-rules ([#192](https://github.com/eslint/css/issues/192)) ([4d3d140](https://github.com/eslint/css/commit/4d3d1401b71d9b39132c8ed4cd842372a23d1135))
* make no-invalid-properties var() case-insensitive ([#232](https://github.com/eslint/css/issues/232)) ([ad0cbdb](https://github.com/eslint/css/commit/ad0cbdbde5bc9e3558789d7b47d70df93cd9964e))
* make relative-font-units unit matching case-insensitive ([#222](https://github.com/eslint/css/issues/222)) ([7a2ecad](https://github.com/eslint/css/commit/7a2ecadddcfbe9e738f88a6c8ba9540b03c088a5))
* prevent false positives for !important inside comments ([#218](https://github.com/eslint/css/issues/218)) ([3c6937a](https://github.com/eslint/css/commit/3c6937a63874e422a1cec46f601260a2ae06b188))
* recursively resolve custom properties in no-invalid-properties ([#237](https://github.com/eslint/css/issues/237)) ([f2ee3fd](https://github.com/eslint/css/commit/f2ee3fd04d57105aa5ceb65fc57219ee382e235c))
* treat at-rule names as case-insensitive across rules ([#233](https://github.com/eslint/css/issues/233)) ([9765135](https://github.com/eslint/css/commit/9765135f5e08ed039d56f408eabc6b6eec316753))
* update baseline data ([8ee9da0](https://github.com/eslint/css/commit/8ee9da0c401d183e11f0fdaa7a82864c226689dc))
* update baseline data ([#207](https://github.com/eslint/css/issues/207)) ([79e06c6](https://github.com/eslint/css/commit/79e06c6510aabeb121ef94d2b48047eb529fbff1))
* update baseline data ([#213](https://github.com/eslint/css/issues/213)) ([30ca01c](https://github.com/eslint/css/commit/30ca01c0dbdc4bf13af9709a8057979dec4e35cf))
* update baseline data ([#234](https://github.com/eslint/css/issues/234)) ([5f409d3](https://github.com/eslint/css/commit/5f409d35e0d47bbe8509bcd4f109a3958197b8c2))
* update baseline data ([#238](https://github.com/eslint/css/issues/238)) ([d058f1c](https://github.com/eslint/css/commit/d058f1cd70e7e680b982f9845794aa4b4dc67f58))
* update baseline data ([#241](https://github.com/eslint/css/issues/241)) ([330c326](https://github.com/eslint/css/commit/330c3269deb673421d9e47a5be7e3c991b99fbed))
* Upgrade @eslint/css-tree ([#243](https://github.com/eslint/css/issues/243)) ([136e2ab](https://github.com/eslint/css/commit/136e2ab4c61dff686d4d3d3a1a0605d70a29a961))
* var() with fallback value in `no-invalid-properties` ([#184](https://github.com/eslint/css/issues/184)) ([1db0b1a](https://github.com/eslint/css/commit/1db0b1ae3873f4efff0f17e95654ed0f744ec04d))

## [0.10.0](https://github.com/eslint/css/compare/css-v0.9.0...css-v0.10.0) (2025-07-11)


### ⚠ BREAKING CHANGES

* Remove Tailwind syntax in favor of external tailwind-csstree ([#166](https://github.com/eslint/css/issues/166))

### Features

* add `allowUnknownVariables` option to no-invalid-properties ([#178](https://github.com/eslint/css/issues/178)) ([932cf62](https://github.com/eslint/css/commit/932cf62fd10e3fea226e2509dda7bf37bc1a1806))
* add `no-invalid-named-grid-areas` rule ([#169](https://github.com/eslint/css/issues/169)) ([162f6e5](https://github.com/eslint/css/commit/162f6e5bd2f3cd2a26f90eef44fa85be6c5a5c93))
* add no-invalid-at-rule-placement rule ([#171](https://github.com/eslint/css/issues/171)) ([bb90e3a](https://github.com/eslint/css/commit/bb90e3a8f08da986817d29ff409bdbf583bfe9df))
* Remove Tailwind syntax in favor of external tailwind-csstree ([#166](https://github.com/eslint/css/issues/166)) ([a035fa7](https://github.com/eslint/css/commit/a035fa7c5b36845b73131e2d1a0b8c83f6c89ffe))


### Bug Fixes

* Enforce unique items in the options of `prefer-logical-properties` ([b720cf8](https://github.com/eslint/css/commit/b720cf89b611eca7b5778d11bdc4c872813209c3))
* enforce unique items in the options of `prefer-logical-properties` ([#176](https://github.com/eslint/css/issues/176)) ([b720cf8](https://github.com/eslint/css/commit/b720cf89b611eca7b5778d11bdc4c872813209c3))
* update baseline data ([#189](https://github.com/eslint/css/issues/189)) ([9bdb155](https://github.com/eslint/css/commit/9bdb15582a5ed72934b224573d90f70c2d4343d5))

## [0.9.0](https://github.com/eslint/css/compare/css-v0.8.1...css-v0.9.0) (2025-06-12)


### Features

* add `relative-font-units` rule ([#133](https://github.com/eslint/css/issues/133)) ([ce256da](https://github.com/eslint/css/commit/ce256da671503792e74ad2113daa72319361c8b5))
* Validate property values containing variables ([#148](https://github.com/eslint/css/issues/148)) ([9fb07fa](https://github.com/eslint/css/commit/9fb07fab74849e31ec363c75ce0d405a6a3108ec))


### Bug Fixes

* Upgrade @eslint/css-tree to update syntax support ([#173](https://github.com/eslint/css/issues/173)) ([8909277](https://github.com/eslint/css/commit/8909277ec65d3e75336070274d13fb390c710069)), closes [#159](https://github.com/eslint/css/issues/159)

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
