#pragma once

#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

typedef enum {
    STATUS_LOADING,
    STATUS_READY,
    STATUS_ERROR,
    STATUS_ACTIVITY
} status_led_state_t;

void setup_status_led();

void set_status_led(status_led_state_t state);

void set_status_led_temporary(status_led_state_t state, uint32_t duration);

void loop_status_led();