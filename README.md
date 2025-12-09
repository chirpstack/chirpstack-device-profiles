# LoRaWAN(R) device-profiles

This repository contains device-profiles for LoRaWAN devices grouped by
vendor. A device-profile contains important information about the capabilities
of the device. For example which LoRaWAN mac-version has been implemented,
which regions are supported, if the device supports Class-B or Class-C, etc...
The aim is to build a complete list of LoRaWAN device-profiles that then can
be imported by ChirpStack or potentially any other LNS.

## Adding a new device-profile

### Fork and clone

* Create a fork of this repository (if not done already).
* Clone your local fork to your computer.

### Starting the web-interface

* Please make sure that you have Docker Compose installed.
* In the root of this repository, execute `docker compose up`.
* Once `Starting server, bind: 0.0.0.0:8090` appears, open the web-interface in your browser by navigating to [http://localhost:8090](http://localhost:8090).

### Add Vendor(s)

* In the left menu, click the _Add vendor_ button.
* Fill in the form and click _Submit_.

### Add profile(s)

* Select a vendor in the left menu (if no vendor is selected).
* Click _Profiles_ in the left menu.
* Click the _Add profile_ menu entry.
* Fill in the form and click _Submit_.

### Add codec(s)

* Select a vendor in the left menu (if no vendor is selected).
* Click _Codecs_ in the left menu.
* Click the _Add codec_ menu entry.
* Fill in the form, before clicking _Submit_ it is a good idea to click _Run codec tests_.

### Add device(s)

* Select a vendor in the left menu (if no vendor is selected).
* Click _Devices_ in the left menu.
* Click the _Add device_ menu entry.
* Fill in the form and add at least one firmware version by clicking the _Add firmware version_ button.
    * For each firmware version you can select one or multiple profiles and optionally a codec.

### Update vendor

* Select a vendor in the left menu (if no vendor is selected).
* Click _Update vendor_ in the left menu.
* Update the vendor by selecting the devices that you added in the previous step.
* Click _Submit_.

### Create pull-request

Once you have added the vendor(s), profile(s), codec(s) and device(s) you wish
to add to this repository you must commit the changes using `git`, push these
to your fork of this repository and create a pull-request in GitHub.

## Structure

Example structure for an `example-vendor` with an `example` device:

```
vendors/
└── example-vendor
    ├── codecs
    │   ├── example.js
    │   ├── test_decode_example.json
    │   └── test_encode_example.json
    ├── devices
    │   └── example.toml
    ├── profiles
    │   └── example-EU868.toml
    └── vendor.toml
```

Please take a look at the `vendors/example-vendor` example documented
configuration files.

### `vendors/example-vendor`

This is the root of the example vendor. It must contain a `vendor.toml`
file. This `vendor.toml`.

### `vendors/example-vendor/codecs`

This directory contains the payload codecs. Codecs can be used by one or
multiple devices. E.g. some vendors have a generic payload codec.

Each codec is expected to have tests for encoding and decoding. If the
codec filename is `example.js`, then you should create two test-files
called `test_decode_example.json` (thus + `test_decode_` prefix and `.json`
extension) and `test_encode_example.json`.

### `vendors/example-vendor/devices`

This directory contains the devices. Each device will have its own `.toml`
configuration.

### `vendors/example-vendor/profiles`

This directory contains the profiles. These profiles can be used by one
or multiple devices. The profile also defines the region.

## License

This repository is distributed under the MIT license. See also `LICENSE`.
