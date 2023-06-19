#include <Arduino.h>
#include <CAN.h>

#include "serial_parser.h"
#include "can.h"
#include "status_led.h"

void send_can_frame(Stream &out, can_frame_t &frame) {
    out.write(FRAME_HEADER);
    out.write(CAN_TYPE);

    uint8_t can_frame_type = 0;

    if (frame.extended) {
        can_frame_type |= 1 << IS_EXTENDED_BIT;
    }

    if (frame.rtr) {
        can_frame_type |= 1 << IS_RTR_BIT;
    }

    can_frame_type |= frame.dlc & DLC_MASK;

    out.write(can_frame_type);

    if (frame.extended) {
        out.write((uint8_t*)&frame.id, sizeof(uint32_t));
    }
    else {
        out.write((uint8_t*)&frame.id, sizeof(uint16_t));
    }

    if (!frame.rtr) {
        out.write(frame.data, frame.dlc);
    }

    out.write(FRAME_FOOTER);
    out.flush();
}

void send_error_frame(Stream &out, uint8_t error_code) {
    out.write(FRAME_HEADER);
    out.write(ERROR_TYPE);
    out.write(error_code);
    out.write(FRAME_FOOTER);
    out.flush();

    set_status_led(STATUS_ERROR);
}

void on_recieve(int packet_size) {
    set_status_led_temporary(STATUS_ACTIVITY, 100);

    can_frame_t frame;

    frame.data = (uint8_t*)malloc(sizeof(uint8_t) * 8);

    frame.extended = CAN.packetExtended();
    frame.rtr = CAN.packetRtr();
    frame.id = CAN.packetId();
    frame.dlc = CAN.packetDlc();

    if (!frame.rtr) {
        CAN.readBytes(frame.data, frame.dlc);
    }

    send_can_frame(Serial, frame);

    free(frame.data);
}

void setupCAN() {
    pinMode(PIN_CAN_STANDBY, OUTPUT);
    digitalWrite(PIN_CAN_STANDBY, false); // turn off STANDBY
    pinMode(PIN_CAN_BOOSTEN, OUTPUT);
    digitalWrite(PIN_CAN_BOOSTEN, true); // turn on booster
}

void set_can_config(config_frame_t* config) {
    CAN.end();

    if (!CAN.begin(config->bit_rate)) {
        send_error_frame(Serial, STARTING_CAN_ERROR);
        return;
    }

    CAN.onReceive(on_recieve);

    switch (config->mode)
    {
    case LOOPBACK_MODE:
        CAN.loopback();
        break;

    case OBSERVE_MODE:
        CAN.observe();
        break;

    default:
        break;
    }

    set_status_led(STATUS_READY);
}

void setup() {
    setup_status_led();

    set_status_led(STATUS_READY);
    set_status_led_temporary(STATUS_LOADING, 100);

    Serial.begin(115200);

    setupCAN();

    if (!CAN.begin(250000)) {
        send_error_frame(Serial, STARTING_CAN_ERROR);
    }

    CAN.onReceive(on_recieve);
}

void loop() {
    loop_status_led();

    parser_result_t* result = serial_parser_stream(Serial);

    if (result != nullptr) {
        switch (result->type) {
        case FRAME_TYPE_CONFIG:
            set_can_config(&result->data.config);
            break;

        case FRAME_TYPE_CAN:
            set_status_led(STATUS_READY);
            //set_status_led_temporary(STATUS_ACTIVITY, 100);
            
            int begin_result = 1;

            if (result->data.can.extended) {
                begin_result = CAN.beginExtendedPacket(result->data.can.id, result->data.can.dlc, result->data.can.rtr);
            }
            else {
                begin_result = CAN.beginPacket(result->data.can.id, result->data.can.dlc, result->data.can.rtr);
            }

            if (begin_result != 1) {
                send_error_frame(Serial, SENDING_CAN_FRAME_ERROR);
                break;
            }

            if (!result->data.can.rtr && result->data.can.dlc > 0) {
                if(!CAN.write(result->data.can.data, result->data.can.dlc)) {
                    send_error_frame(Serial, SENDING_CAN_FRAME_ERROR);
                    break;
                }
            }

            if(!CAN.endPacket()) {
                send_error_frame(Serial, SENDING_CAN_FRAME_ERROR);
                break;
            }

            break;
        }
    }
}