module {
    public type HeaderField = (Text, Text);

    public type HttpRequest = {
        method : Text;
        url : Text;
        headers : [HeaderField];
        body : Blob;
    };

    public type HttpResponse = {
        status_code : Nat16;
        headers : [HeaderField];
        body : Blob;
        streaming_strategy: ?StreamingStrategy;
    };

    public type StreamingToken = {
        resource: Text;
        index : Nat;
    };

    public type StreamingCallbackHttpResponse = {
        body : Blob;
        token : ?StreamingToken;
    };

    public type StreamingCallback = shared query (StreamingToken) -> async StreamingCallbackHttpResponse;

    public type StreamingStrategy = {
        #Callback : {
            callback : StreamingCallback;
            token : StreamingToken;
        };
    };
};