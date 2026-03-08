import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  // Initialize the authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student record type
  type Student = {
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

  module Student {
    public func compareByRollNo(student1 : Student, student2 : Student) : Order.Order {
      Nat.compare(student1.rollNo, student2.rollNo);
    };
  };

  var nextId = 1;

  // Persistent storage for students using Map
  let students = Map.empty<Nat, Student>();

  // Add new student record, returns new id
  // No authorization check - open to all callers
  public shared ({ caller }) func addStudent(
    rollNo : Nat,
    name : Text,
    grNo : Text,
    penNo : Text,
    apaarNo : Text,
    udiseCode : Text,
    aadharNo : Text,
    col1 : Text,
    col2 : Text,
    col3 : Text,
  ) : async Nat {
    let newStudent : Student = {
      id = nextId;
      rollNo;
      name;
      grNo;
      penNo;
      apaarNo;
      udiseCode;
      aadharNo;
      col1;
      col2;
      col3;
    };

    students.add(nextId, newStudent);
    nextId += 1;
    newStudent.id;
  };

  // Get all students sorted by rollNo ascending
  // No authorization check - open to all callers
  public query ({ caller }) func getStudents() : async [Student] {
    students.values().toArray().sort(Student.compareByRollNo);
  };

  // Delete student by id
  // No authorization check - open to all callers
  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    students.remove(id);
  };

  // Update existing student by id
  // No authorization check - open to all callers
  public shared ({ caller }) func updateStudent(
    id : Nat,
    rollNo : Nat,
    name : Text,
    grNo : Text,
    penNo : Text,
    apaarNo : Text,
    udiseCode : Text,
    aadharNo : Text,
    col1 : Text,
    col2 : Text,
    col3 : Text,
  ) : async () {
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?_existing) {
        let updatedStudent : Student = {
          id;
          rollNo;
          name;
          grNo;
          penNo;
          apaarNo;
          udiseCode;
          aadharNo;
          col1;
          col2;
          col3;
        };
        students.add(id, updatedStudent);
      };
    };
  };
};
