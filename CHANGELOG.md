# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
 - SASS precompiler

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

[Unreleased]: https://github.com/smartercleanup/platform/compare/0.6.4...HEAD
[0.7.0]: https://github.com/smartercleanup/platform/compare/0.6.4...0.7.0
[0.6.4]: https://github.com/smartercleanup/platform/compare/0.6.3...0.6.4
[0.6.3]: https://github.com/smartercleanup/platform/compare/0.6.2...0.6.3
[0.6.2]: https://github.com/smartercleanup/platform/compare/0.6.1...0.6.2
[0.6.1]: https://github.com/smartercleanup/platform/compare/0.6.0...0.6.1
