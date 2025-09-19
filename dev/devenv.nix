{
  pkgs,
  lib,
  ...
}: let
  patchedAuth = pkgs.runCommand "patched-auth" {} ''
    mkdir -p $out/bin
    cp ${../proxy/auth.sh} $out/bin/auth
    chmod +x $out/bin/auth
    patchShebangs $out/bin/auth
  '';
in {
  dotenv.enable = true;

  packages = [pkgs.jq];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    pnpm.enable = true;
  };

  scripts = {
    start-proxy = {
      exec = ''
        export ACUBE_TOKEN=$(${patchedAuth}/bin/auth | jq -r .token)
        echo "Token exported to ACUBE_TOKEN"
        cd ../proxy/
        pnpm install
        pnpm build
        pnpm start
      '';
    };

    test-proxy = {
      exec = ''
        export PROXY_HOST=http://localhost:3000
        export SENDER=`node ../proxy/token.js 0208:1023290711`
        export RECIPIENT=`node ../proxy/token.js 0208:0705969661`
        echo $SENDER
        echo $RECIPIENT
        curl $PROXY_HOST
        curl -H "Authorization: Bearer $RECIPIENT" "$PROXY_HOST/invoices/outgoing?page=1" | jq
        curl -H "Authorization: Bearer $RECIPIENT" "$PROXY_HOST/credit-notes/incoming" | jq
      '';
    };
  };
}
