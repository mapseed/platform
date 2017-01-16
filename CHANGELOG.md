# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - on our `develop` branch (unreleased)
### Added
 - SASS precompiler
 - Add in-app editor
 - List view performance improvements

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

[Unreleased]: https://github.com/smartercleanup/platform/compare/0.7.3...develop
[0.7.3]: https://github.com/smartercleanup/platform/compare/0.7.2...0.7.3
[0.7.2]: https://github.com/smartercleanup/platform/compare/0.7.1...0.7.2
[0.7.1]: https://github.com/smartercleanup/platform/compare/0.7.0...0.7.1
[0.7.0]: https://github.com/smartercleanup/platform/compare/0.6.4...0.7.0
[0.6.4]: https://github.com/smartercleanup/platform/compare/0.6.3...0.6.4
[0.6.3]: https://github.com/smartercleanup/platform/compare/0.6.2...0.6.3
[0.6.2]: https://github.com/smartercleanup/platform/compare/0.6.1...0.6.2
[0.6.1]: https://github.com/smartercleanup/platform/compare/0.6.0...0.6.1
