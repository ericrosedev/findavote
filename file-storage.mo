import Http "http";
import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

module {
    type Asset = {
        mimeType : Text;
        chunks : [Blob];
    };

    public type FileStorage = {
        var assets : OrderedMap.Map<Text, Asset>;
        var pending : OrderedMap.Map<Text, Asset>;
    };

    public func new() : FileStorage {
        let pathMap = OrderedMap.Make<Text>(Text.compare);
        let assets = pathMap.empty<Asset>();
        let pending = pathMap.empty<Asset>();
        {
            var assets;
            var pending;
        };
    };

    public type FileMetadata = {
        path : Text;
        mimeType : Text;
        size : Nat;
    };

    public func list(storage : FileStorage) : [FileMetadata] {
        let pathMap = OrderedMap.Make<Text>(Text.compare);
        let metadata = pathMap.map<Asset, FileMetadata>(
            storage.assets,
            func(path, asset) {
                let size = Array.foldLeft<Blob, Nat>(asset.chunks, 0, func(sum, chunk) { sum + chunk.size() });
                let mimeType = asset.mimeType;
                { path; mimeType; size };
            }
        );
        Iter.toArray(pathMap.vals(metadata));
    };

    public func upload(storage : FileStorage, path : Text, mimeType : Text, chunk : Blob, complete : Bool) {
        let pathMap = OrderedMap.Make<Text>(Text.compare);
        let chunks = switch (pathMap.get(storage.pending, path)) {
            case null [chunk];
            case (?old) Array.append(old.chunks, [chunk]);
        };
        let combined = { mimeType; chunks };
        if (complete) {
            ignore pathMap.remove(storage.pending, path);
            storage.assets := pathMap.put(storage.assets, path, combined);
        } else {
            storage.pending := pathMap.put(storage.pending, path, combined);
        };
    };

    public func delete(storage : FileStorage, path : Text) {
        let pathMap = OrderedMap.Make<Text>(Text.compare);
        storage.assets := pathMap.remove(storage.assets, path).0;
        storage.pending := pathMap.remove(storage.pending, path).0;
    };

    let skipCertificate = ("IC-Certificate", "skip");

    let notFound : Http.HttpResponse = {
        status_code = 404;
        headers = [
            ("Content-Type", "text/html"),
            skipCertificate
        ];
        body = "<h1>404 - Not Found</h1>";
        streaming_strategy = null;
    };

    public func fileRequest(storage : FileStorage, request : Http.HttpRequest, callback : Http.StreamingCallback) : Http.HttpResponse {
        let path = switch (Text.stripStart(request.url, #char('/'))) {
            case null request.url;
            case (?stripped) stripped;
        };
        let pathMap = OrderedMap.Make<Text>(Text.compare);
        switch (pathMap.get(storage.assets, path)) {
            case null notFound;
            case (?asset) {
                let streamingStrategy = if (asset.chunks.size() == 1) {
                    null;
                } else {
                    let token = {
                        resource = path;
                        index = 1;
                    };
                    ?(#Callback({ callback; token }));
                };
                let firstChunk = asset.chunks[0];
                return {
                    status_code = 200;
                    headers = [
                        ("Content-Type", asset.mimeType),
                        ("Cache-Control", "public, max-age=31536000, immutable"),
                        skipCertificate
                    ];
                    body = firstChunk;
                    streaming_strategy = streamingStrategy;
                };
            };
        };
    };

    public func httpStreamingCallback(storage : FileStorage, token : Http.StreamingToken) : Http.StreamingCallbackHttpResponse {
        let path = token.resource;
        let pathMap = OrderedMap.Make<Text>(Text.compare);
        let asset = switch (pathMap.get(storage.assets, path)) {
            case null Debug.trap("Invalid resource");
            case (?asset) asset;
        };
        let nextChunk = asset.chunks[token.index];
        let nextToken = if (token.index + 1 < asset.chunks.size()) {
            ?{
                resource = path;
                index = token.index + 1;
            };
        } else {
            null;
        };
        {
            body = nextChunk;
            token = nextToken;
        };
    };
};