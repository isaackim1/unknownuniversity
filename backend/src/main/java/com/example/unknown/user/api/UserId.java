package com.example.unknown.user.api;

import com.example.unknown.user.api.model.UserProfile;
import io.fluxzero.sdk.modeling.Id;

public class UserId extends Id<UserProfile> {
    public UserId(String id) {
        super(id);
    }
}
