#include "status_led.h"

Adafruit_NeoPixel status_pixel = Adafruit_NeoPixel(1, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

status_led_state_t return_state;
status_led_state_t current_state;
uint32_t return_state_time;

void setup_status_led()
{
    pinMode(PIN_NEOPIXEL_POWER, OUTPUT);
    digitalWrite(PIN_NEOPIXEL_POWER, HIGH);

    status_pixel.begin();
    set_status_led(STATUS_LOADING);

    status_pixel.setBrightness(5);
}

void set_status_led(uint8_t r, uint8_t g, uint8_t b)
{
    status_pixel.setPixelColor(0, r, g, b);
    status_pixel.show();
}

void set_status_led(status_led_state_t state)
{
    switch (state) {
        case STATUS_LOADING:
            set_status_led(0, 0, 255);
            break;
        case STATUS_READY:
            set_status_led(0, 255, 0);
            break;
        case STATUS_ERROR:
            set_status_led(255, 0, 0);
            break;
        case STATUS_ACTIVITY:
            set_status_led(255, 255, 255);
            break;
    }

    current_state = state;
}

void set_status_led_temporary(status_led_state_t state, uint32_t duration)
{
    if (current_state == state) return;

    return_state = current_state;

    set_status_led(state);

    return_state_time = millis() + duration;
}

void loop_status_led() 
{
    if (return_state_time > 0 && millis() > return_state_time) {
        set_status_led(return_state);
        return_state_time = 0;
    }
}