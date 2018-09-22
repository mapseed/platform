Shareabouts Data Model
-----------------------

The data served by the Shareabouts API and used by the web app is
composed of just a few kinds of flexible objects:

### Data Sets

A user of the API can create any number of "data sets".
All location information you create or retrieve is associated with a
single Data Set.  Currently, the SA web app can only be configured to
work with a single Data Set.

### Places

A Place represents a geographic point and can have a few data
attributes stored on it:

* data - this is an arbitrary JSON object.
* submitter name - a string.
* dataset - a Place belongs to a single Data Set.

### Submissions

A Submission represents some data attached to a Place.
Every Submission has a type, which is represented by its parent
SubmissionSet (see below).  A Submission has these data attributes:

* data - an arbitrary JSON object containing the submitted data.
* submitter_name - a string.
* parent - the SubmissionSet it belongs to.


### SubmissionSets

A SubmissionSet is a group of Submissions attached
to a single Place.  A SubmissionSet has these attributes:

* place
* submission_type - a string identifying the type of these
  submissions; for example, "comment" or "rating" or "vote".


### Activity

Activity represents all user activity on the site. Any time you
create, modify, or delete a Place or Submission, an Activity is
generated, identifying who did it, what happened, and when.

These are used for the "activity stream" that appears on the right
sidebar on the default Shareabouts design.
