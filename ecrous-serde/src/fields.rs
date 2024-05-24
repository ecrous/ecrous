pub trait Field {
    fn get_type(&self) -> String;
}

#[derive(Debug)]
pub struct CharField {
    pub min_length: Option<i32>,
    pub max_length: Option<i32>,
}

impl CharField {
    pub fn new() -> CharField {
        CharField {
            min_length: None,
            max_length: None,
        }
    }

    pub fn min_length(mut self, value: i32) -> CharField {
        self.max_length = Some(value);
        self
    }

    pub fn max_length(mut self, value: i32) -> CharField {
        self.max_length = Some(value);
        self
    }
}

impl Field for CharField {
    fn get_type(&self) -> String {
        "char_field".to_string()
    }
}
