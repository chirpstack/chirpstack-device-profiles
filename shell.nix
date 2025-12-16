{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-25.11.tar.gz") {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.rustup
    pkgs.protobuf
    pkgs.nodejs
    pkgs.yarn
    pkgs.protoc-gen-grpc-web
  ];
  shellHook = ''
    export PATH=$PATH:~/.cargo/bin
  '';
}
