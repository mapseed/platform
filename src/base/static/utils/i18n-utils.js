const nonConfigurableI18nKeys = new Set([
  // PB Durham custom detail views
  "PBDurhamHighlyFeasibleMsg",
  "PBDurhamModeratelyFeasibleMsg",
  "PBDurhamNotFeasibleMsg",
  "PBDurhamHighlyEquitableMsg",
  "PBDurhamModeratelyEquitableMsg",
  "PBDurhamNotEquitableMsg",
  "PBDurhamHighlyImpactfulMsg",
  "PBDurhamModeratelyImpactfulMsg",
  "PBDurhamNotImpactfulMsg",
  "PBDurhamRelatedIdeasHeader",
  "PBDurhamUnpublishedWarningMsg",
  "PBDurhamScoreSummaryHeader",
  "PBDurhamFeasibilityLabel",
  "PBDurhamEquityLabel",
  "PBDurhamImpactLabel",

  // Standard UI text
  "geocodeAddressBarPlaceholderMsg",
  "logOut",
  "mapCenterpointOverlayMsg",
  "makeSelection", // DropdownField
  "search", // PlaceList
  "mostSupports", // PlaceList
  "mostComments", // PlaceList
  "mostRecent", // PlaceList
  "supportThis", // PlaceListItem
  "comment", // PlaceListItem
  "viewOnMap", // PlaceListItem
  "commentsLabel", // PlaceListItem
]);

export default function isValidNonConfigurableI18nKey(
  i18nKey,
  currentLanguage,
) {
  if (!nonConfigurableI18nKeys.has(i18nKey)) {
    // If the passed key is not one of the non-configurable keys, by default
    // it's valid as far as this series of checks is concerned.
    return true;
  } else if (currentLanguage === "en") {
    // If the passed key *is* one of the non-configurable keys and the current
    // language is English (which should be the native language of all
    // hard-coded non-configurable UI text), then the key's corresponding text
    // is valid in its native English form.
    return true;
  }

  // If neither of the above checks pass, then we have a non-valid key, and the
  // key's corresponding text needs to be sent to the translate API.
  return false;
}
