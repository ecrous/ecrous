// use darling::FromMeta;
// use ecrous_serde::serializers::Serializer;
use proc_macro::TokenStream;
// use quote::quote;
// use syn::{self, parse_macro_input, DeriveInput, ItemFn};

// #[derive(FromMeta)]
// struct MacroArgs {
//     #[darling(default)]
//     verbose: bool
// }

// #[proc_macro_attribute]
// pub fn bebebe(args: TokenStream, input: TokenStream) -> TokenStream {
//     let attr_args = parse_macro_input!(args as DeriveInput);
//     let mut input = parse_macro_input!(input as ItemFn);

//     let attr_args = match MacroArgs::from_list(&attr_args) {}

//     TokenStream::new()
// }

#[proc_macro_derive(Serializer)]
pub fn serializer_derive(item: TokenStream) -> TokenStream {
    println!("I AM HERER");
    println!("{}", item);
    let a = 5;
    println!("{}", a);
    TokenStream::new()
}
