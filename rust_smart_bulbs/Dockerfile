# Dockerfile for Rust smart bulbs
FROM rust:1.76 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:buster-slim
WORKDIR /app
COPY --from=builder /app/target/release/rust_smart_bulbs ./rust_smart_bulbs
CMD ["./rust_smart_bulbs"]
