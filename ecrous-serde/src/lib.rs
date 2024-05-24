pub mod errors;
pub mod fields;
pub mod serializers;

#[derive(Debug)]
pub struct Serializer {}

impl Serializer {
    pub fn basic() -> serializers::BasicSerializer {
        serializers::BasicSerializer::new()
    }

    pub fn char_field() -> fields::CharField {
        fields::CharField::new()
    }
}
