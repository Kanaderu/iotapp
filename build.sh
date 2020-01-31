#!/bin/bash
expo init iotapp
expo build:android -t apk
expo build:ios
expo start
