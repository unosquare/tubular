#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

TARGET_BRANCH="gh-pages"

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deply)
git clone $REPO out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..

# Move content
mkdir out/reports/$TRAVIS_BUILD_NUMBER
cp report/**/* out/reports/$TRAVIS_BUILD_NUMBER
ls out/reports/$TRAVIS_BUILD_NUMBER

# Now let's go have some fun with the cloned repo
cd out
git config user.name "Travis CI"
git config user.email "geovanni.perez@gmail.com"

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add reports/$TRAVIS_BUILD_NUMBER/*
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
cd ..
openssl aes-256-cbc -K $encrypted_a8a17fe422f5_key -iv $encrypted_a8a17fe422f5_iv -in tubular.enc -out tubular -d
chmod 600 tubular
eval `ssh-agent -s`
ssh-add tubular

cd out
# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH