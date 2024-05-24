pub struct SerializeError {
    pub name: String,
    pub description: String,
}

pub fn default_serialize_errors() -> Vec<SerializeError> {
    vec![
        SerializeError {
            name: "required".to_string(),
            description: "This field is required.".to_string(),
        },
        SerializeError {
            name: "null".to_string(),
            description: "This field may not be null.".to_string(),
        },
    ]
}
