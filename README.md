# TOTP

This is a placeholder readme, the product is basically just a TOTP desktop application.

DO NOT USE IT. I am currently storing secrets in plaintext. if you are fine with it, go ahead.
I am evaluating secure storages but there are none that satisfy my requirements, primarily:

1. cross platform
2. easy to use
3. secure
   (prs are welcome if you know any such tool)

sqlcipher is not cross-platform enough (tauri will support android in future it's not just desktop anymore), `keyring` crate
doesn't support android, manual encryption is not easy to implement, may not be secure as well. tauri stronghold plugin has no docs,and features

Once I am satisfied with the features in this application, I will decide on secure storage. until then you can try it out
or use at your own risk.
