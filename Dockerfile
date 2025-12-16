# Copy binary stage
FROM --platform=$BUILDPLATFORM alpine:3.22.1 AS binary

ARG TARGETPLATFORM

COPY interface/target/x86_64-unknown-linux-musl/release/chirpstack-device-profiles-interface /usr/bin/chirpstack-device-profiles-interface-x86_64

RUN case "$TARGETPLATFORM" in \
	"linux/amd64") \
		cp /usr/bin/chirpstack-device-profiles-interface-x86_64 /usr/bin/chirpstack-device-profiles-interface; \
		;; \
	esac;

# Final stage
FROM alpine:3.22.1

RUN apk --no-cache add \
    ca-certificates

COPY --from=binary /usr/bin/chirpstack-device-profiles-interface /usr/bin/chirpstack-device-profiles-interface
USER nobody:nogroup
ENTRYPOINT ["/usr/bin/chirpstack-device-profiles-interface"]

