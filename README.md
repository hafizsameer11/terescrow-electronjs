# terescrow-app

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS (direct install — DMG)
$ yarn build:mac

# For macOS App Store / Apple Business Custom App (MAS .pkg)
$ yarn build:mac:mas              # Apple Silicon
$ yarn build:mac:mas:intel        # Intel
$ yarn build:mac:mas:universal    # Universal (both architectures)

# For Linux
$ yarn build:linux
```

## Direct distribution (DMG + notarization)

After `yarn build:mac`:

```bash
xcrun notarytool submit dist/TercescrowAdmin-1.8.9-arm64.dmg --keychain-profile hmstech --wait
xcrun stapler staple dist/TercescrowAdmin-1.8.9-arm64.dmg

xcrun notarytool submit dist/TercescrowAdmin-1.8.9.dmg --keychain-profile hmstech --wait
```

## Apple Business / Mac App Store upload (Custom App)

Bundle ID: `com.tercescrow.admin`

### 1. Apple Developer prerequisites

In [Apple Developer](https://developer.apple.com/account) → Certificates, Identifiers & Profiles:

1. **App ID** — `com.tercescrow.admin` (Mac)
2. **Certificates**
   - `3rd Party Mac Developer Application`
   - `3rd Party Mac Developer Installer`
3. **Provisioning profile** — Mac App Store profile for `com.tercescrow.admin`  
   Download and save as `build/macos/TercescrowAdmin.provisionprofile` (gitignored), or let electron-builder fetch it automatically (step 2).

Install both certificates in **Keychain Access** on the Mac used for builds.

### 2. Signing environment

Export these before building (adjust names to match your Keychain):

```bash
export CSC_NAME="3rd Party Mac Developer Application: Your Company (TEAMID)"
export CSC_INSTALLER_NAME="3rd Party Mac Developer Installer: Your Company (TEAMID)"

# Optional — auto-download provisioning profile instead of placing file locally:
export APPLE_ID="your@apple-id.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export ASC_PROVIDER="TEAMID"
```

Optional local profile (add to `package.json` → `build.mas.provisioningProfile`):

```json
"provisioningProfile": "build/macos/TercescrowAdmin.provisionprofile"
```

### 3. Build the upload package

```bash
yarn build:mac:mas
```

Output: `dist/mas/TercescrowAdmin-<version>.pkg`

### 4. Upload to App Store Connect

Using **Transporter** (Mac App Store app) or CLI:

```bash
xcrun altool --upload-app -f dist/mas/TercescrowAdmin-*.pkg -t macos -u "$APPLE_ID" -p "$APPLE_APP_SPECIFIC_PASSWORD"
```

Or with App Store Connect API key:

```bash
xcrun altool --upload-app -f dist/mas/TercescrowAdmin-*.pkg -t macos --apiKey KEY_ID --apiIssuer ISSUER_ID
```

### 5. App Store Connect (Custom App)

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **TercescrowAdmin**
2. **Pricing and Availability** → enable **Custom App on Apple Business Manager**
3. Add the client **Organization ID** from Apple Business → Settings
4. Submit the uploaded build for review
5. Client assigns the app in **Apple Business** → Apps & Services → Blueprint
