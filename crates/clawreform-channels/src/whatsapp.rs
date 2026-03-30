use crate::types::{ChannelAdapter, ChannelContent, ChannelMessage, ChannelStatus, ChannelType, ChannelUser};
use async_trait::async_trait;
use futures::Stream;
use std::pin::Pin;

pub struct WhatsAppAdapter;

impl WhatsAppAdapter {
    pub fn new() -> Self { Self }
}

#[async_trait]
impl ChannelAdapter for WhatsAppAdapter {
    fn name(&self) -> &str { "WhatsAppAdapter" }
    fn channel_type(&self) -> ChannelType { ChannelType::WhatsApp }
    async fn start(&self) -> Result<Pin<Box<dyn Stream<Item = ChannelMessage> + Send>>, Box<dyn std::error::Error>> {
        Err("stub adapter".into())
    }
    async fn send(&self, _user: &ChannelUser, _content: ChannelContent) -> Result<(), Box<dyn std::error::Error>> { Ok(()) }
    async fn stop(&self) -> Result<(), Box<dyn std::error::Error>> { Ok(()) }
    fn status(&self) -> ChannelStatus { ChannelStatus::default() }
}
