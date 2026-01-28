// Smart Bulb Module for Home Automation
// This code is designed to match Alexa naming conventions for bulbs

#[derive(Debug)]
pub struct SmartBulb {
    pub name: String,
    pub is_on: bool,
}

impl SmartBulb {
    pub fn new(name: &str) -> Self {
        SmartBulb {
            name: name.to_string(),
            is_on: false,
        }
    }

    pub fn turn_on(&mut self) {
        self.is_on = true;
        println!("{} is now ON", self.name);
    }
    pub fn turn_off(&mut self) {
        self.is_on = false;
        println!("{} is now OFF", self.name);
    }

    pub fn status(&self) {
        let state = if self.is_on { "ON" } else { "OFF" };
        println!("{} is currently {}", self.name, state);
    }
}

fn main() {
    let mut living_room_1 = SmartBulb::new("Living Room 1");
    let mut living_room_2 = SmartBulb::new("Living Room 2");

    living_room_1.status();
    living_room_2.status();

    living_room_1.turn_on();
    living_room_2.turn_off();

    living_room_1.status();
    living_room_2.status();
}
