use crate::{HandDefinition, HandResult};

pub fn bundled_hands() -> Vec<(&'static str, &'static str, &'static str)> {
    Vec::new()
}

pub fn parse_bundled(
    id: &str,
    toml_content: &str,
    skill_content: &str,
) -> HandResult<HandDefinition> {
    let _ = (id, toml_content, skill_content);
    Err(crate::HandError::NotFound(id.to_string()))
}
