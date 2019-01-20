
Example project to illustrate [issue 43](https://github.com/nathanhleung/install-peerdeps/issues/43).

This project has data-forge 1.3.3 installed.

It also has data-forge-indicators 0.1.7 which has a peer dependency on data-forge 1.0.10.

Previously using install-peerdeps to install peers of data-forge-indicators would have overwritten data-forge with the older version.