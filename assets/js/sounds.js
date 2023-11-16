const playerSounds = {
    "allClear": new Howl({src: ['/assets/sounds/allclear.ogg']}),
    "clearb2b": new Howl({src: ['/assets/sounds/clearbtb.ogg'], volume: 0.7}),
    "clearQuad": new Howl({src: ['/assets/sounds/clearquad.ogg'], volume: 0.7}),
    "clearSpin": new Howl({src: ['/assets/sounds/clearspin.ogg'], volume: 0.7}),
    "b2bbreak": new Howl({src: ['/assets/sounds/btb_break.ogg']}),

    "combobreak": new Howl({src: ['/assets/sounds/combobreak.ogg']}),
    "0combo": new Howl({src: ['/assets/sounds/clearline.ogg'], volume: 0.5}),
    "1combo": new Howl({src: ['/assets/sounds/combo_1.ogg'], volume: 0.7}),
    "2combo": new Howl({src: ['/assets/sounds/combo_2.ogg'], volume: 0.7}),
    "3combo": new Howl({src: ['/assets/sounds/combo_3.ogg'], volume: 0.7}),
    "4combo": new Howl({src: ['/assets/sounds/combo_4.ogg'], volume: 0.7}),
    "5combo": new Howl({src: ['/assets/sounds/combo_5.ogg'], volume: 0.7}),
    "6combo": new Howl({src: ['/assets/sounds/combo_6.ogg'], volume: 0.7}),
    "7combo": new Howl({src: ['/assets/sounds/combo_7.ogg'], volume: 0.7}),
    "8combo": new Howl({src: ['/assets/sounds/combo_8.ogg'], volume: 0.7}),
    "9combo": new Howl({src: ['/assets/sounds/combo_9.ogg'], volume: 0.7}),
    "10combo": new Howl({src: ['/assets/sounds/combo_10.ogg'], volume: 0.7}),
    "11combo": new Howl({src: ['/assets/sounds/combo_11.ogg'], volume: 0.7}),
    "12combo": new Howl({src: ['/assets/sounds/combo_12.ogg'], volume: 0.7}),
    "13combo": new Howl({src: ['/assets/sounds/combo_13.ogg'], volume: 0.7}),
    "14combo": new Howl({src: ['/assets/sounds/combo_14.ogg'], volume: 0.7}),
    "15combo": new Howl({src: ['/assets/sounds/combo_15.ogg'], volume: 0.7}),
    "16combo": new Howl({src: ['/assets/sounds/combo_16.ogg'], volume: 0.7}),
    "1combo_power": new Howl({src: ['/assets/sounds/combo_1_power.ogg']}),
    "2combo_power": new Howl({src: ['/assets/sounds/combo_2_power.ogg']}),
    "3combo_power": new Howl({src: ['/assets/sounds/combo_3_power.ogg']}),
    "4combo_power": new Howl({src: ['/assets/sounds/combo_4_power.ogg']}),
    "5combo_power": new Howl({src: ['/assets/sounds/combo_5_power.ogg']}),
    "6combo_power": new Howl({src: ['/assets/sounds/combo_6_power.ogg']}),
    "7combo_power": new Howl({src: ['/assets/sounds/combo_7_power.ogg']}),
    "8combo_power": new Howl({src: ['/assets/sounds/combo_8_power.ogg']}),
    "9combo_power": new Howl({src: ['/assets/sounds/combo_9_power.ogg']}),
    "10combo_power": new Howl({src: ['/assets/sounds/combo_10_power.ogg']}),
    "11combo_power": new Howl({src: ['/assets/sounds/combo_11_power.ogg']}),
    "12combo_power": new Howl({src: ['/assets/sounds/combo_12_power.ogg']}),
    "13combo_power": new Howl({src: ['/assets/sounds/combo_13_power.ogg']}),
    "14combo_power": new Howl({src: ['/assets/sounds/combo_14_power.ogg']}),
    "15combo_power": new Howl({src: ['/assets/sounds/combo_15_power.ogg']}),
    "16combo_power": new Howl({src: ['/assets/sounds/combo_16_power.ogg']}),

    "hardDrop": new Howl({src: ['/assets/sounds/harddrop.ogg']}),
    "hold": new Howl({src: ['/assets/sounds/hold.ogg']}),
    "move": new Howl({src: ['/assets/sounds/move.ogg']}),
    "rotate": new Howl({src: ['/assets/sounds/rotate.ogg']}),
    "softDrop": new Howl({src: ['/assets/sounds/softdrop.ogg']}),
    "spin": new Howl({src: ['/assets/sounds/spin.ogg']}),


    "garbage_in_large": new Howl({src: ['/assets/sounds/garbage_in_large.ogg']}),
    "garbage_in_medium": new Howl({src: ['/assets/sounds/garbage_in_medium.ogg']}),
    "garbage_in_small": new Howl({src: ['/assets/sounds/garbage_in_small.ogg']}),

    "garbage_out_large": new Howl({src: ['/assets/sounds/garbage_out_large.ogg']}),
    "garbage_out_medium": new Howl({src: ['/assets/sounds/garbage_out_medium.ogg']}),
    "garbage_out_small": new Howl({src: ['/assets/sounds/garbage_out_small.ogg']}),

    "garbageRise": new Howl({src: ['/assets/sounds/garbagerise.ogg']}),

    "topout": new Howl({src: ['/assets/sounds/topout.ogg'], volume: 0.5}),
    "gameOver": new Howl({src: ['/assets/sounds/gameover.ogg']})


    // Up to 16 combo
};

Howler.volume(0.4);