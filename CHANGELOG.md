# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [staging] - on our `master` branch (staging)

## [0.8.2] - 2017-08-12
### Added
 - Added accessible-autocomplete suggestion box
 - Map slider support
 - WMSTM support (for 1936 aerial imagery)
### Changed
 - Rich image text updates
 - Sidebar updates
 - Cluster updates

## [0.8.1] - 2017-06-04
### Added
 - Using social sharing service for social bot metatags
 - Prettier dep for code formatting
### Changed
 - Leaflet marker cluster update
 - Favicon fixes

## [0.8.0] - 2017-05-26
### Added
 - Babel ES6 transpiler into our build step
 - Added "right clinging" sidebar
 - Scripts to rule them all
 - Admin editor! (w/ rich text and geometry editor)
 - Support layers with data from ESRI Map Services
 - Support multiple datasets per layer
### Changed
 - Onboarding/docs updates
 - Story logic improvements
### Removed
 - Deprecated ui tests (jasmine)

## [0.7.5] - 2017-03-05
### Changed
 - Replaced 'eval' statements with a static eval and AST parser
 - Refactored pboakland flavor-specific views to extend from base views, instead of overriding the base views.

## [0.7.4] - 2017-02-19
### Added
 - webpack is now used for our bundling
### Changed
 - models.js has now been refactors into a models directory, separating all of our models.

## [0.7.3] - 2016-12-30
### Added
 - Run `npm start` to build/watch our scss files and start the dev server locally.
 - node-sass precompiler added, and installed via `npm install`.
### Removed
 - Our libsass compass gem is no longer needed for our scss precompiler.
### Changed
 - We are now using node-sass for our scss precompiler.


## [0.7.2] - 2016-12-02
### Added
 - Email notifications and updated configuration

## [0.7.1] - 2016-10-13
### Added
 - Added CHANGELOG
### Changed
 - Updates to sync development branch 0.7.x with 0.6.4 for Docker data container updates.

## [0.7.0] - 2016-09-17
### Added
 -  We can now push to and pull from multiple datasets on the API by adding the following to our config:

  ```
     - id: duwamish
       type: place
       slug: report

  ```

  Then we can add our api secrets to our .env as follows:

  ```
  DUWAMISH_DATASET_KEY=MGMzOWU2ZmUwZmFkZDYzZTI1ZmQ3MDhi
  DUWAMISH_SITE_URL=https://dev-api.heyduwamish.org/api/v2/smartercleanup/datasets/duwamish/
  ```

### Changed
 - Dockerfile updates

## [0.6.4] - 2016-10-02
### Added
 - Added CHANGELOG
### Changed
 - Dockerfile updates to data container - data containers now have namespaced directories.
 - Lots of flavor-specific configuration updates

## [0.6.3] - 2016-02-28

## [0.6.2] - 2016-02-27

## [0.6.1] - 2016-02-15

## 0.6.0 - 2016-02-06

[staging]: https://github.com/smartercleanup/platform/compare/0.8.1...master
[0.8.2]: https://github.com/smartercleanup/platform/compare/0.8.1...0.8.2
[0.8.1]: https://github.com/smartercleanup/platform/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/smartercleanup/platform/compare/0.7.5...0.8.0
[0.7.5]: https://github.com/smartercleanup/platform/compare/0.7.4...0.7.5
[0.7.4]: https://github.com/smartercleanup/platform/compare/0.7.3...0.7.4
[0.7.3]: https://github.com/smartercleanup/platform/compare/0.7.2...0.7.3
[0.7.2]: https://github.com/smartercleanup/platform/compare/0.7.1...0.7.2
[0.7.1]: https://github.com/smartercleanup/platform/compare/0.7.0...0.7.1
[0.7.0]: https://github.com/smartercleanup/platform/compare/0.6.4...0.7.0
[0.6.4]: https://github.com/smartercleanup/platform/compare/0.6.3...0.6.4
[0.6.3]: https://github.com/smartercleanup/platform/compare/0.6.2...0.6.3
[0.6.2]: https://github.com/smartercleanup/platform/compare/0.6.1...0.6.2
[0.6.1]: https://github.com/smartercleanup/platform/compare/0.6.0...0.6.1
