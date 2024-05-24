use crate::errors;
use crate::fields;

pub trait Serializer {}

trait Saveable {
    fn save() -> Result<bool, Vec<errors::SerializeError>>;
}

pub struct BasicSerializer {
    pub fields: Vec<&'static dyn fields::Field>,
}

impl BasicSerializer {
    pub fn new() -> BasicSerializer {
        BasicSerializer { fields: vec![] }
    }

    pub fn append(mut self, fields: &mut Vec<&'static dyn fields::Field>) -> BasicSerializer {
        self.fields.append(fields);
        self
    }
}
