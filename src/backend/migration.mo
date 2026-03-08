import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldStudent = {
    id : Nat;
    rollNo : Nat;
    name : Text;
    grNo : Text;
    penNo : Text;
    apaarNo : Text;
    udiseCode : Text;
    aadharNo : Text;
    col1 : Text;
    col2 : Text;
    col3 : Text;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    students : Map.Map<Nat, OldStudent>;
    nextId : Nat;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewStudent = OldStudent;
  type NewUserProfile = OldUserProfile;

  type NewActor = {
    students : Map.Map<Nat, NewStudent>;
    nextId : Nat;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
