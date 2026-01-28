# Dockerfile for Rust smart bulbs
FROM rust:latest as builder
WORKDIR /app
COPY . .
ENV PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
RUN cargo build --release

FROM debian:buster-slim
WORKDIR /app
COPY --from=builder /app/target/release/rust_smart_bulbs ./rust_smart_bulbs
CMD ["./rust_smart_bulbs"]
