//
// Created by Marc Rousavy on 25.01.24
//

#include <fbjni/fbjni.h>
#include <jni.h>
#include "ResizePlugin.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    vision::ResizePlugin::registerNatives();
  });
}
