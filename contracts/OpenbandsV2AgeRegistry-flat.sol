// SPDX-License-Identifier: MIT
pragma solidity =0.8.28 ^0.8.20;

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/self/contracts/contracts/constants/AttestationId.sol

/**
 * @title AttestationId Library
 * @notice This library provides attestation identifiers used across contracts.
 * @dev Currently, it contains the constant E_PASSPORT which represents the identifier
 * for an E-PASSPORT attestation computed as Poseidon("E-PASSPORT").
 */
library AttestationId {
    /**
     * @notice Identifier for an E-PASSPORT attestation.
     * @dev The identifier is computed based on the hash of "E-PASSPORT" using the Poseidon hash function.
     * Here it is hardcoded as bytes32(uint256(1)) for demonstration purposes.
     */
    bytes32 constant E_PASSPORT = bytes32(uint256(1));
    bytes32 constant EU_ID_CARD = bytes32(uint256(2));
    bytes32 constant AADHAAR = bytes32(uint256(3));
}

// lib/self/contracts/contracts/interfaces/IDscCircuitVerifier.sol

/**
 * @title IDscCircuitVerifier
 * @notice Interface for verifying zero-knowledge proofs related to the DSC circuit.
 * @dev This interface defines the structure of a DSC circuit proof and exposes a function to verify such proofs.
 */
interface IDscCircuitVerifier {
    /**
     * @notice Represents a DSC circuit proof.
     * @param a An array of two unsigned integers representing the proof component 'a'.
     * @param b A 2x2 array of unsigned integers representing the proof component 'b'.
     * @param c An array of two unsigned integers representing the proof component 'c'.
     * @param pubSignals An array of two unsigned integers representing the public signals associated with the proof.
     */
    struct DscCircuitProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[2] pubSignals;
    }

    /**
     * @notice Verifies a given DSC circuit zero-knowledge proof.
     * @dev This function checks the validity of the provided DSC proof parameters.
     * @param pA The 'a' component of the proof.
     * @param pB The 'b' component of the proof.
     * @param pC The 'c' component of the proof.
     * @param pubSignals The public signals associated with the proof.
     * @return A boolean value indicating whether the provided proof is valid (true) or not (false).
     */
    function verifyProof(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[2] calldata pubSignals
    ) external view returns (bool);
}

// lib/self/contracts/contracts/interfaces/IPoseidonT3.sol

/**
 * @title IPoseidonT3
 * @notice Interface for the PoseidonT3 library
 */
interface IPoseidonT3 {
    function hash(uint256[2] memory inputs) external pure returns (uint256);
}

// lib/self/contracts/contracts/interfaces/IRegisterCircuitVerifier.sol

/**
 * @title IRegisterCircuitVerifier
 * @notice Interface for verifying register circuit proofs.
 * @dev This interface defines the structure of a register circuit proof and exposes a function to verify such proofs.
 */

struct GenericProofStruct {
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
    uint256[] pubSignals;
}

interface IRegisterCircuitVerifier {
    /**
     * @notice Represents a register circuit proof.
     * @dev This structure encapsulates the required proof elements.
     * @param a An array of two unsigned integers representing the proof component 'a'.
     * @param b A 2x2 array of unsigned integers representing the proof component 'b'.
     * @param c An array of two unsigned integers representing the proof component 'c'.
     * @param pubSignals An array of three unsigned integers representing the public signals associated with the proof.
     */
    struct RegisterCircuitProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[3] pubSignals;
    }

    /**
     * @notice Verifies a given register circuit proof.
     * @dev This function checks the validity of the provided proof parameters.
     * @param a The 'a' component of the proof.
     * @param b The 'b' component of the proof.
     * @param c The 'c' component of the proof.
     * @param pubSignals The public signals associated with the proof.
     * @return isValid A boolean value indicating whether the provided proof is valid (true) or not (false).
     */
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[3] calldata pubSignals
    ) external view returns (bool isValid);
}

interface IAadhaarRegisterCircuitVerifier {
    /**
     * @notice Verifies a given register circuit proof.
     * @dev This function checks the validity of the provided proof parameters.
     * @param a The 'a' component of the proof.
     * @param b The 'b' component of the proof.
     * @param c The 'c' component of the proof.
     * @param pubSignals The public signals associated with the proof.
     * @return isValid A boolean value indicating whether the provided proof is valid (true) or not (false).
     */
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata pubSignals
    ) external view returns (bool isValid);
}

// lib/self/contracts/contracts/interfaces/ISelfVerificationRoot.sol

/**
 * @title ISelfVerificationRoot
 * @notice Interface for self-verification infrastructure integration
 * @dev Provides base functionality for verifying and disclosing identity credentials
 */
interface ISelfVerificationRoot {
    /**
     * @notice Structure containing proof data for disclose circuits
     * @dev Contains the proof elements required for zero-knowledge verification
     * @param a First proof element
     * @param b Second proof element (2x2 matrix)
     * @param c Third proof element
     * @param pubSignals Array of 21 public signals for the circuit
     */
    struct DiscloseCircuitProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[21] pubSignals;
    }

    /**
     * @notice Structure containing verified identity disclosure output data
     * @dev Contains all disclosed identity information after successful verification
     * @param attestationId Unique identifier for the identity documents
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Unique nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed representation of forbidden countries list
     * @param issuingState The state/country that issued the identity document
     * @param name Array of name components
     * @param idNumber The identity document number
     * @param nationality The nationality of the document holder
     * @param dateOfBirth Date of birth in string format
     * @param gender Gender of the document holder
     * @param expiryDate Expiry date of the identity document
     * @param olderThan Verified age threshold (e.g., 18 for adult verification)
     * @param ofac Array of OFAC (Office of Foreign Assets Control) compliance flags
     */
    struct GenericDiscloseOutputV2 {
        bytes32 attestationId;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
        string issuingState;
        string[] name;
        string idNumber;
        string nationality;
        string dateOfBirth;
        string gender;
        string expiryDate;
        uint256 olderThan;
        bool[3] ofac;
    }

    /**
     * @notice Verifies a self-proof using the bytes-based interface
     * @dev Parses relayer data format and validates against contract settings before calling hub V2
     * @param proofPayload Packed data from relayer in format: | 32 bytes attestationId | proof data |
     * @param userContextData User-defined data in format: | 32 bytes configId | 32 bytes destChainId | 32 bytes userIdentifier | data |
     */
    function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) external;

    /**
     * @notice Callback function called upon successful verification
     * @dev Only the identity verification hub V2 contract should call this function
     * @param output The verification output data containing disclosed identity information
     * @param userData The user-defined data passed through the verification process
     */
    function onVerificationSuccess(bytes memory output, bytes memory userData) external;
}

// lib/self/contracts/contracts/libraries/Formatter.sol

/**
 * @title Formatter Library
 * @notice A library providing utility functions to format names, dates, and encode data.
 */
library Formatter {
    error InvalidDateLength();
    error InvalidYearRange();
    error InvalidMonthRange();
    error InvalidDayRange();
    error InvalidFieldElement();
    error InvalidDateDigit();

    uint256 constant MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH = 40;
    uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    /**
     * @notice Formats a full name string into first name(s) and last name.
     * @dev The input is expected to contain a last name, followed by a "<<" separator and then first name(s).
     *      The returned array contains the first names at index 0 and the last name at index 1.
     * @param input The input string structured as "lastName<<firstName(s)".
     * @return names An array of two strings: [firstName(s), lastName].
     */
    function formatName(string memory input) internal pure returns (string[] memory) {
        bytes memory inputBytes = bytes(input);
        bytes memory firstNameBytes;
        bytes memory lastNameBytes;
        string[] memory names = new string[](2);

        uint256 i = 0;
        // Extract last name
        while (i < inputBytes.length && inputBytes[i] != "<") {
            lastNameBytes = abi.encodePacked(lastNameBytes, inputBytes[i]);
            i++;
        }

        // Skip the separator "<<".
        i += 2;

        // Extract first names.
        while (i < inputBytes.length) {
            if (inputBytes[i] == "<") {
                if (i + 1 < inputBytes.length && inputBytes[i + 1] == "<") {
                    break;
                }
                firstNameBytes = abi.encodePacked(firstNameBytes, " ");
            } else {
                firstNameBytes = abi.encodePacked(firstNameBytes, inputBytes[i]);
            }
            i++;
        }

        names[0] = string(firstNameBytes);
        names[1] = string(lastNameBytes);
        return names;
    }

    /**
     * @notice Formats a compact date string into a human-readable date.
     * @dev Expects the input date string to have exactly 6 characters in YYMMDD format.
     *      Returns the date in "DD-MM-YY" format.
     * @param date A string representing the date in YYMMDD format.
     * @return A formatted date string in the format "DD-MM-YY".
     */
    function formatDate(string memory date) internal pure returns (string memory) {
        bytes memory dateBytes = bytes(date);
        if (dateBytes.length != 6) {
            revert InvalidDateLength();
        }

        if (dateBytes[2] > "1" || (dateBytes[2] == "1" && dateBytes[3] > "2")) {
            revert InvalidMonthRange();
        }

        if (dateBytes[4] > "3" || (dateBytes[4] == "3" && dateBytes[5] > "1")) {
            revert InvalidDayRange();
        }

        string memory year = substring(date, 0, 2);
        string memory month = substring(date, 2, 4);
        string memory day = substring(date, 4, 6);

        return string(abi.encodePacked(day, "-", month, "-", year));
    }

    /**
     * @notice Formats a full year date string into a human-readable date.
     * @dev Expects the input date string to have exactly 8 characters in YYYYMMDD format.
     *      Returns the date in "YYYY-MM-DD" format.
     * @param date A string representing the date in YYYYMMDD format.
     * @return A formatted date string in the format "YYYY-MM-DD".
     */
    function formatDateFullYear(string memory date) internal pure returns (string memory) {
        bytes memory dateBytes = bytes(date);
        if (dateBytes.length != 8) {
            revert InvalidDateLength();
        }

        if (dateBytes[4] > "1" || (dateBytes[4] == "1" && dateBytes[5] > "2")) {
            revert InvalidMonthRange();
        }

        if (dateBytes[6] > "3" || (dateBytes[6] == "3" && dateBytes[7] > "1")) {
            revert InvalidDayRange();
        }

        string memory year = substring(date, 0, 4);
        string memory month = substring(date, 4, 6);
        string memory day = substring(date, 6, 8);

        return string(abi.encodePacked(day, "-", month, "-", year));
    }

    /**
     * @notice Converts an ASCII numeral code to its corresponding unsigned integer.
     * @dev The input must represent an ASCII code for digits (0-9), i.e. between 48 and 57.
     *      Reverts with InvalidAsciiCode if the input is out of range.
     * @param numAscii The ASCII code of a digit character.
     * @return The numeric value (0-9) corresponding to the ASCII code.
     */
    function numAsciiToUint(uint256 numAscii) internal pure returns (uint256) {
        return (numAscii - 48);
    }

    /**
     * @notice Converts an array of three field elements into a bytes representation.
     * @dev Each element is converted into a specific number of bytes: 31, 31, and 31 respectively.
     * @param publicSignals An array of three unsigned integers representing field elements.
     * @return bytesArray A bytes array of total length 93 that encodes the three field elements.
     */
    function fieldElementsToBytes(uint256[3] memory publicSignals) internal pure returns (bytes memory) {
        if (
            publicSignals[0] >= SNARK_SCALAR_FIELD ||
            publicSignals[1] >= SNARK_SCALAR_FIELD ||
            publicSignals[2] >= SNARK_SCALAR_FIELD
        ) {
            revert InvalidFieldElement();
        }
        uint8[3] memory bytesCount = [31, 31, 31];
        bytes memory bytesArray = new bytes(93);

        uint256 index = 0;
        for (uint256 i = 0; i < 3; i++) {
            uint256 element = publicSignals[i];
            for (uint8 j = 0; j < bytesCount[i]; j++) {
                bytesArray[index++] = bytes1(uint8(element & 0xff));
                element = element >> 8;
            }
        }
        return bytesArray;
    }

    function fieldElementsToBytesIdCard(uint256[4] memory publicSignals) internal pure returns (bytes memory) {
        if (
            publicSignals[0] >= SNARK_SCALAR_FIELD ||
            publicSignals[1] >= SNARK_SCALAR_FIELD ||
            publicSignals[2] >= SNARK_SCALAR_FIELD ||
            publicSignals[3] >= SNARK_SCALAR_FIELD
        ) {
            revert InvalidFieldElement();
        }
        uint8[4] memory bytesCount = [31, 31, 31, 1];
        bytes memory bytesArray = new bytes(94);

        uint256 index = 0;
        for (uint256 i = 0; i < 4; i++) {
            uint256 element = publicSignals[i];
            for (uint8 j = 0; j < bytesCount[i]; j++) {
                bytesArray[index++] = bytes1(uint8(element & 0xff));
                element = element >> 8;
            }
        }
        return bytesArray;
    }

    function fieldElementsToBytesAadhaar(uint256[4] memory publicSignals) internal pure returns (bytes memory) {
        for (uint256 i = 0; i < 4; i++) {
            if (publicSignals[i] >= SNARK_SCALAR_FIELD) {
                revert InvalidFieldElement();
            }
        }

        uint8[4] memory bytesCount = [31, 31, 31, 26];
        bytes memory bytesArray = new bytes(119);

        uint256 index = 0;
        for (uint256 i = 0; i < 4; i++) {
            uint256 element = publicSignals[i];
            for (uint8 j = 0; j < bytesCount[i]; j++) {
                bytesArray[index++] = bytes1(uint8(element & 0xff));
                element = element >> 8;
            }
        }

        return bytesArray;
    }

    /**
     * @notice Extracts forbidden country codes from a packed uint256.
     * @dev Each forbidden country is represented by 3 bytes in the packed data.
     *      The function extracts up to MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH forbidden countries.
     * @param publicSignals A packed uint256 containing encoded forbidden country data.
     * @return forbiddenCountries An array of strings representing the forbidden country codes.
     */
    function extractForbiddenCountriesFromPacked(
        uint256[4] memory publicSignals
    ) internal pure returns (string[MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH] memory forbiddenCountries) {
        for (uint256 i = 0; i < 4; i++) {
            if (publicSignals[i] >= SNARK_SCALAR_FIELD) {
                revert InvalidFieldElement();
            }
        }

        for (uint256 j = 0; j < MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH; j++) {
            uint256 byteIndex = (j * 3) % 93;
            uint256 index = j / 31;

            if (byteIndex + 2 < 31) {
                uint256 shift = byteIndex * 8;
                uint256 mask = 0xFFFFFF;
                uint256 packedData = (publicSignals[index * 3] >> shift) & mask;
                uint256 reversedPackedData = ((packedData & 0xff) << 16) |
                    ((packedData & 0xff00)) |
                    ((packedData & 0xff0000) >> 16);
                forbiddenCountries[j] = string(abi.encodePacked(uint24(reversedPackedData)));
            } else if (byteIndex < 31) {
                uint256 part0 = (publicSignals[0] >> (byteIndex * 8));
                uint256 part1 = publicSignals[1] & 0x00ffff;
                uint256 reversedPart1 = ((part1 & 0xff) << 8) | ((part1 & 0xff00) >> 8);
                uint256 combined = reversedPart1 | (part0 << 16);
                forbiddenCountries[j] = string(abi.encodePacked(uint24(combined)));
            } else if (byteIndex + 2 < 62) {
                uint256 byteIndexIn1 = byteIndex - 31;
                uint256 shift = byteIndexIn1 * 8;
                uint256 mask = 0xFFFFFF;
                uint256 packedData = (publicSignals[1] >> shift) & mask;
                uint256 reversedPackedData = ((packedData & 0xff) << 16) |
                    ((packedData & 0xff00)) |
                    ((packedData & 0xff0000) >> 16);
                forbiddenCountries[j] = string(abi.encodePacked(uint24(reversedPackedData)));
            } else if (byteIndex < 62) {
                uint256 part0 = (publicSignals[1] >> ((byteIndex - 31) * 8)) & 0x00ffff;
                uint256 reversedPart0 = ((part0 & 0xff) << 8) | ((part0 & 0xff00) >> 8);
                uint256 part1 = publicSignals[2] & 0x0000ff;
                uint256 combined = part1 | (reversedPart0 << 8);
                forbiddenCountries[j] = string(abi.encodePacked(uint24(combined)));
            } else if (byteIndex < 93) {
                uint256 byteIndexIn1 = byteIndex - 62;
                uint256 shift = byteIndexIn1 * 8;
                uint256 mask = 0xFFFFFF;
                uint256 packedData = (publicSignals[2] >> shift) & mask;
                uint256 reversedPackedData = ((packedData & 0xff) << 16) |
                    ((packedData & 0xff00)) |
                    ((packedData & 0xff0000) >> 16);
                forbiddenCountries[j] = string(abi.encodePacked(uint24(reversedPackedData)));
            }
        }

        return forbiddenCountries;
    }

    /**
     * @notice Converts an array of 6 numerical values representing a date into a Unix timestamp.
     * @dev Each element in the dateNum array is taken modulo 10, converted to its ASCII digit,
     *      and concatenated to form a date string in YYMMDD format. This string is then converted
     *      into a Unix timestamp using dateToUnixTimestamp.
     * @param dateNum An array of 6 unsigned integers representing a date in YYMMDD format.
     * @return timestamp The Unix timestamp corresponding to the provided date.
     */
    function proofDateToUnixTimestamp(uint256[6] memory dateNum) internal pure returns (uint256) {
        for (uint256 i = 0; i < 6; i++) {
            if (dateNum[i] > 9) {
                revert InvalidDateDigit();
            }
        }
        string memory date = "";
        for (uint256 i = 0; i < 6; i++) {
            date = string(abi.encodePacked(date, bytes1(uint8(48 + (dateNum[i] % 10)))));
        }
        uint256 currentTimestamp = dateToUnixTimestamp(date);
        return currentTimestamp;
    }

    /**
     * @notice Converts an array of 3 numerical values representing a date into a Unix timestamp.
     * @dev The input is expected to be in the format [year, month, day] and is not padded with 0s.
     * @param dateNum An array of 3 unsigned integers representing a date in YYMMDD format.
     * @return timestamp The Unix timestamp corresponding to the provided date.
     */
    function proofDateToUnixTimestampNumeric(uint256[3] memory dateNum) internal pure returns (uint256) {
        if (dateNum[1] > 12 || dateNum[2] > 31) {
            revert InvalidDateDigit();
        }
        return toTimestamp(dateNum[0], dateNum[1], dateNum[2]);
    }

    /**
     * @notice Converts a date string in YYMMDD format into a Unix timestamp.
     * @dev Parses the date string by extracting year, month, and day components using substring,
     *      converts each component to an integer, and then computes the timestamp via toTimestamp.
     *      Reverts if the input string is not exactly 6 characters long.
     * @param date A 6-character string representing the date in YYMMDD format.
     * @return timestamp The Unix timestamp corresponding to the input date.
     */
    function dateToUnixTimestamp(string memory date) internal pure returns (uint256) {
        bytes memory dateBytes = bytes(date);
        if (dateBytes.length != 6) {
            revert InvalidDateLength();
        }

        if (dateBytes[2] > "1" || (dateBytes[2] == "1" && dateBytes[3] > "2")) {
            revert InvalidMonthRange();
        }

        if (dateBytes[4] > "3" || (dateBytes[4] == "3" && dateBytes[5] > "1")) {
            revert InvalidDayRange();
        }

        uint256 year = parseDatePart(substring(date, 0, 2)) + 2000;
        uint256 month = parseDatePart(substring(date, 2, 4));
        uint256 day = parseDatePart(substring(date, 4, 6));

        return toTimestamp(year, month, day);
    }

    /**
     * @notice Extracts a substring from a given string.
     * @dev Returns the substring from startIndex (inclusive) to endIndex (exclusive).
     * @param str The input string.
     * @param startIndex The starting index of the substring (inclusive).
     * @param endIndex The ending index of the substring (exclusive).
     * @return The resulting substring.
     */
    function substring(string memory str, uint256 startIndex, uint256 endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);

        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }

        return string(result);
    }

    /**
     * @notice Parses a numeric string and returns its unsigned integer representation.
     * @dev Assumes the input string contains only numeric characters.
     * @param value The string representing a number.
     * @return result The parsed unsigned integer.
     */
    function parseDatePart(string memory value) internal pure returns (uint256) {
        bytes memory tempEmptyStringTest = bytes(value);
        if (tempEmptyStringTest.length == 0) {
            return 0;
        }

        uint256 digit;
        uint256 result;
        for (uint256 i = 0; i < tempEmptyStringTest.length; i++) {
            digit = uint8(tempEmptyStringTest[i]) - 48;
            result = result * 10 + digit;
        }
        return result;
    }

    /**
     * @notice Converts a specific date into a Unix timestamp.
     * @dev Calculates the timestamp by summing the number of days for years, months, and days since January 1, 1970.
     *      Takes leap years into account during the calculation.
     * @param year The full year (e.g., 2023).
     * @param month The month (1-12).
     * @param day The day of the month.
     * @return timestamp The Unix timestamp corresponding to the given date.
     */
    function toTimestamp(uint256 year, uint256 month, uint256 day) internal pure returns (uint256 timestamp) {
        uint16 i;

        if (year < 1970 || year > 2100) {
            revert InvalidYearRange();
        }

        if (month < 1 || month > 12) {
            revert InvalidMonthRange();
        }

        // Year.
        for (i = 1970; i < year; i++) {
            if (isLeapYear(i)) {
                timestamp += 366 days;
            } else {
                timestamp += 365 days;
            }
        }

        // Month.
        uint8[12] memory monthDayCounts;
        monthDayCounts[0] = 31;
        if (isLeapYear(year)) {
            monthDayCounts[1] = 29;
        } else {
            monthDayCounts[1] = 28;
        }
        monthDayCounts[2] = 31;
        monthDayCounts[3] = 30;
        monthDayCounts[4] = 31;
        monthDayCounts[5] = 30;
        monthDayCounts[6] = 31;
        monthDayCounts[7] = 31;
        monthDayCounts[8] = 30;
        monthDayCounts[9] = 31;
        monthDayCounts[10] = 30;
        monthDayCounts[11] = 31;

        if (day < 1 || day > monthDayCounts[month - 1]) {
            revert InvalidDayRange();
        }

        for (i = 1; i < month; i++) {
            timestamp += monthDayCounts[i - 1] * 1 days;
        }

        // Day.
        timestamp += (day - 1) * 1 days;

        return timestamp;
    }

    /**
     * @notice Checks whether a given year is a leap year.
     * @param year The year to check.
     * @return True if the year is a leap year, otherwise false.
     */
    function isLeapYear(uint256 year) internal pure returns (bool) {
        if (year < 1970 || year > 2100) {
            revert InvalidYearRange();
        }

        if (year % 4 != 0) {
            return false;
        } else if (year % 100 != 0) {
            return true;
        } else if (year % 400 != 0) {
            return false;
        } else {
            return true;
        }
    }
}

// lib/self/contracts/contracts/libraries/SelfStructs.sol

/**
 * @title SelfStructs
 * @dev Library containing data structures for Self protocol identity verification
 * @notice Defines structs for passport verification, EU ID verification, and generic disclosure outputs
 */
library SelfStructs {
    /**
     * @dev Header structure for Hub input containing contract version and scope information
     * @param contractVersion Version of the contract being used
     * @param scope Scope identifier for the verification request
     * @param attestationId Unique identifier for the attestation
     */
    struct HubInputHeader {
        uint8 contractVersion;
        uint256 scope;
        bytes32 attestationId;
    }

    /**
     * @dev Output structure for passport verification results
     * @param attestationId Unique identifier for the attestation
     * @param revealedDataPacked Packed binary data of revealed information
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     */
    struct PassportOutput {
        uint256 attestationId;
        bytes revealedDataPacked;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
    }

    /**
     * @dev Output structure for EU ID verification results
     * @param attestationId Unique identifier for the attestation
     * @param revealedDataPacked Packed binary data of revealed information
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     */
    struct EuIdOutput {
        uint256 attestationId;
        bytes revealedDataPacked;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
    }

    /**
     * @dev Output structure for Aadhaar verification results
     * @param attestationId Unique identifier for the attestation
     * @param revealedDataPacked Packed binary data of revealed information
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     */
    struct AadhaarOutput {
        uint256 attestationId;
        bytes revealedDataPacked;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
    }

    /// @dev OFAC verification mode: Passport number only
    uint256 constant passportNoOfac = 0;
    /// @dev OFAC verification mode: Name and date of birth
    uint256 constant nameAndDobOfac = 1;
    /// @dev OFAC verification mode: Name and year of birth
    uint256 constant nameAndYobOfac = 2;

    /**
     * @dev Generic disclosure output structure (Version 2) with detailed personal information
     * @param attestationId Unique identifier for the attestation
     * @param userIdentifier Unique identifier for the user
     * @param nullifier Cryptographic nullifier to prevent double-spending
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     * @param issuingState Country or state that issued the document
     * @param name Array of name components (first, middle, last names)
     * @param idNumber Government-issued identification number
     * @param nationality Nationality of the document holder
     * @param dateOfBirth Date of birth in string format
     * @param gender Gender of the document holder
     * @param expiryDate Document expiration date in string format
     * @param olderThan Minimum age verification result
     * @param ofac Array of OFAC (Office of Foreign Assets Control) verification results for different modes
     */
    struct GenericDiscloseOutputV2 {
        bytes32 attestationId;
        uint256 userIdentifier;
        uint256 nullifier;
        uint256[4] forbiddenCountriesListPacked;
        string issuingState;
        string[] name;
        string idNumber;
        string nationality;
        string dateOfBirth;
        string gender;
        string expiryDate;
        uint256 olderThan;
        bool[3] ofac;
    }

    /**
     * @dev Verification configuration structure (Version 1)
     * @param olderThanEnabled Whether minimum age verification is enabled
     * @param olderThan Minimum age requirement
     * @param forbiddenCountriesEnabled Whether forbidden countries check is enabled
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     * @param ofacEnabled Array of boolean flags for different OFAC verification modes
     */
    struct VerificationConfigV1 {
        bool olderThanEnabled;
        uint256 olderThan;
        bool forbiddenCountriesEnabled;
        uint256[4] forbiddenCountriesListPacked;
        bool[3] ofacEnabled;
    }

    /**
     * @dev Verification configuration structure (Version 2)
     * @param olderThanEnabled Whether minimum age verification is enabled
     * @param olderThan Minimum age requirement
     * @param forbiddenCountriesEnabled Whether forbidden countries check is enabled
     * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
     * @param ofacEnabled Array of boolean flags for different OFAC verification modes
     */
    struct VerificationConfigV2 {
        bool olderThanEnabled;
        uint256 olderThan;
        bool forbiddenCountriesEnabled;
        uint256[4] forbiddenCountriesListPacked;
        bool[3] ofacEnabled;
    }
}

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/self/contracts/contracts/constants/CircuitConstantsV2.sol

/**
 * @title Circuit Constants Library
 * @notice This library defines constants representing indices used to access public signals
 *         of various circuits such as register, DSC, and VC/Disclose.
 * @dev These indices map directly to specific data fields in the corresponding circuits proofs.
 */
library CircuitConstantsV2 {
    // ---------------------------
    // Register Circuit Constants
    // ---------------------------

    /**
     * @notice Index to access the nullifier in the register circuit public signals.
     */
    uint256 constant REGISTER_NULLIFIER_INDEX = 0;

    /**
     * @notice Index to access the commitment in the register circuit public signals.
     */
    uint256 constant REGISTER_COMMITMENT_INDEX = 1;

    /**
     * @notice Index to access the Merkle root in the register circuit public signals.
     */
    uint256 constant REGISTER_MERKLE_ROOT_INDEX = 2;

    // ---------------------------
    // DSC Circuit Constants
    // ---------------------------

    /**
     * @notice Index to access the tree leaf in the DSC circuit public signals.
     */
    uint256 constant DSC_TREE_LEAF_INDEX = 0;

    /**
     * @notice Index to access the CSCA root in the DSC circuit public signals.
     */
    uint256 constant DSC_CSCA_ROOT_INDEX = 1;

    // ---------------------------
    // Aadhaar Circuit Constants
    // ---------------------------
    /**
     * @notice Index to access the pubkey commitment in the Aadhaar circuit public signals.
     */
    uint256 constant AADHAAR_UIDAI_PUBKEY_COMMITMENT_INDEX = 0;
    uint256 constant AADHAAR_NULLIFIER_INDEX = 1;
    uint256 constant AADHAAR_COMMITMENT_INDEX = 2;
    uint256 constant AADHAAR_TIMESTAMP_INDEX = 3;

    // -------------------------------------
    // VC and Disclose Circuit Constants
    // -------------------------------------

    /**
     * @notice Structure containing circuit indices for a specific attestation type.
     */
    struct DiscloseIndices {
        uint256 revealedDataPackedIndex;
        uint256 forbiddenCountriesListPackedIndex;
        uint256 nullifierIndex;
        uint256 attestationIdIndex;
        uint256 merkleRootIndex;
        uint256 currentDateIndex;
        uint256 namedobSmtRootIndex;
        uint256 nameyobSmtRootIndex;
        uint256 scopeIndex;
        uint256 userIdentifierIndex;
        uint256 passportNoSmtRootIndex;
    }

    /**
     * @notice Returns the circuit indices for a given attestation type.
     * @param attestationId The attestation identifier.
     * @return indices The DiscloseIndices struct containing all relevant indices.
     */
    function getDiscloseIndices(bytes32 attestationId) internal pure returns (DiscloseIndices memory indices) {
        if (attestationId == AttestationId.E_PASSPORT) {
            return
                DiscloseIndices({
                    revealedDataPackedIndex: 0,
                    forbiddenCountriesListPackedIndex: 3,
                    nullifierIndex: 7,
                    attestationIdIndex: 8,
                    merkleRootIndex: 9,
                    currentDateIndex: 10,
                    namedobSmtRootIndex: 17,
                    nameyobSmtRootIndex: 18,
                    scopeIndex: 19,
                    userIdentifierIndex: 20,
                    passportNoSmtRootIndex: 16
                });
        } else if (attestationId == AttestationId.EU_ID_CARD) {
            return
                DiscloseIndices({
                    revealedDataPackedIndex: 0,
                    forbiddenCountriesListPackedIndex: 4,
                    nullifierIndex: 8,
                    attestationIdIndex: 9,
                    merkleRootIndex: 10,
                    currentDateIndex: 11,
                    namedobSmtRootIndex: 17,
                    nameyobSmtRootIndex: 18,
                    scopeIndex: 19,
                    userIdentifierIndex: 20,
                    passportNoSmtRootIndex: 99
                });
        } else if (attestationId == AttestationId.AADHAAR) {
            return
                DiscloseIndices({
                    revealedDataPackedIndex: 2,
                    forbiddenCountriesListPackedIndex: 6,
                    nullifierIndex: 0,
                    attestationIdIndex: 10,
                    merkleRootIndex: 16,
                    currentDateIndex: 11,
                    namedobSmtRootIndex: 14,
                    nameyobSmtRootIndex: 15,
                    scopeIndex: 17,
                    userIdentifierIndex: 18,
                    passportNoSmtRootIndex: 99
                });
        } else {
            revert("Invalid attestation ID");
        }
    }
}

// lib/self/contracts/contracts/libraries/SelfUtils.sol

library SelfUtils {
    struct UnformattedVerificationConfigV2 {
        uint256 olderThan;
        string[] forbiddenCountries;
        bool ofacEnabled;
    }

    /**
     * @dev Packs an array of forbidden countries into chunks suitable for circuit inputs
     * @param forbiddenCountries Array of 3-character country codes
     * @return output Array of 4 uint256 values containing packed country data
     */
    function packForbiddenCountriesList(
        string[] memory forbiddenCountries
    ) internal pure returns (uint256[4] memory output) {
        uint256 MAX_BYTES_IN_FIELD = 31;
        uint256 REQUIRED_CHUNKS = 4;

        // Convert country codes to bytes array
        bytes memory packedBytes;

        // Validate and pack country codes
        for (uint256 i = 0; i < forbiddenCountries.length; i++) {
            bytes memory countryBytes = bytes(forbiddenCountries[i]);

            // Validate country code length
            require(countryBytes.length == 3, "Invalid country code: must be exactly 3 characters long");

            // Append country code bytes
            packedBytes = abi.encodePacked(packedBytes, countryBytes);
        }

        uint256 maxBytes = packedBytes.length;
        uint256 packSize = MAX_BYTES_IN_FIELD;
        uint256 numChunks = (maxBytes + packSize - 1) / packSize; // Ceiling division

        // Pack bytes into chunks
        for (uint256 i = 0; i < numChunks && i < REQUIRED_CHUNKS; i++) {
            uint256 sum = 0;

            for (uint256 j = 0; j < packSize; j++) {
                uint256 idx = packSize * i + j;
                if (idx < maxBytes) {
                    uint256 value = uint256(uint8(packedBytes[idx]));
                    uint256 shift = 8 * j;
                    sum += value << shift;
                }
            }

            output[i] = sum;
        }

        // Remaining elements are already initialized to 0
        return output;
    }

    /**
     * @dev Formats an unstructured verification configuration into the standardized circuit-compatible format
     *
     * This function transforms a simplified input structure into the complete verification configuration
     * required by the verification config required by the hub.
     *
     * @notice Enabled Status Logic:
     * - `olderThanEnabled`: Automatically set to `true` when `olderThan > 0`
     * - `forbiddenCountriesEnabled`: Automatically set to `true` when `forbiddenCountries.length > 0`
     * - `ofacEnabled`: Uses the provided boolean value, replicated across all 3 OFAC check levels
     *
     *
     * @param unformattedVerificationConfigV2 The simplified input configuration containing:
     *        - `olderThan`: Minimum age threshold (0 = disabled, >0 = enabled)
     *        - `forbiddenCountries`: Array of 3-letter country codes (empty = disabled, non-empty = enabled)
     *        - `ofacEnabled`: Boolean flag for all OFAC verification levels
     *
     * @return verificationConfigV2 The formatted configuration ready for circuit consumption with:
     *         - Auto-computed enabled flags based on input values
     *         - Packed forbidden countries list for efficient circuit processing
     *         - Replicated OFAC settings across all verification levels
     */
    function formatVerificationConfigV2(
        UnformattedVerificationConfigV2 memory unformattedVerificationConfigV2
    ) internal pure returns (SelfStructs.VerificationConfigV2 memory verificationConfigV2) {
        bool[3] memory ofacArray;
        ofacArray[0] = unformattedVerificationConfigV2.ofacEnabled;
        ofacArray[1] = unformattedVerificationConfigV2.ofacEnabled;
        ofacArray[2] = unformattedVerificationConfigV2.ofacEnabled;

        verificationConfigV2 = SelfStructs.VerificationConfigV2({
            olderThanEnabled: unformattedVerificationConfigV2.olderThan > 0,
            olderThan: unformattedVerificationConfigV2.olderThan,
            forbiddenCountriesEnabled: unformattedVerificationConfigV2.forbiddenCountries.length > 0,
            forbiddenCountriesListPacked: packForbiddenCountriesList(
                unformattedVerificationConfigV2.forbiddenCountries
            ),
            ofacEnabled: ofacArray
        });
    }

    /**
     * @notice Convert string to BigInt using ASCII encoding
     * @dev Converts each character to its ASCII value and packs them into a uint256
     * @param str The input string (must be ASCII only, max 31 bytes)
     * @return The resulting BigInt value
     */
    function stringToBigInt(string memory str) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        require(strBytes.length <= 31, "String too long for BigInt conversion");

        uint256 result = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            // Ensure ASCII only (0-127)
            require(uint8(strBytes[i]) <= 127, "Non-ASCII character detected");
            result = (result << 8) | uint256(uint8(strBytes[i]));
        }
        return result;
    }

    /**
     * @notice Converts an address to its lowercase hex string representation
     * @dev Produces a string like "0x1234567890abcdef..." (42 characters total)
     * @param addr The address to convert
     * @return The hex string representation of the address
     */
    function addressToHexString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);

        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }

        return string(str);
    }
}

// lib/self/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol

/**
 * @title IIdentityVerificationHubV2
 * @notice Interface for the Identity Verification Hub V2 for verifying zero-knowledge proofs.
 * @dev Defines all external and public functions from IdentityVerificationHubImplV2.
 */
interface IIdentityVerificationHubV2 {
    // ====================================================
    // External Functions
    // ====================================================

    /**
     * @notice Registers a commitment using a register circuit proof.
     * @dev Verifies the register circuit proof and then calls the Identity Registry to register the commitment.
     * @param attestationId The attestation ID.
     * @param registerCircuitVerifierId The identifier for the register circuit verifier to use.
     * @param registerCircuitProof The register circuit proof data.
     */
    function registerCommitment(
        bytes32 attestationId,
        uint256 registerCircuitVerifierId,
        IRegisterCircuitVerifier.RegisterCircuitProof memory registerCircuitProof
    ) external;

    /**
     * @notice Registers a DSC key commitment using a DSC circuit proof.
     * @dev Verifies the DSC proof and then calls the Identity Registry to register the dsc key commitment.
     * @param attestationId The attestation ID.
     * @param dscCircuitVerifierId The identifier for the DSC circuit verifier to use.
     * @param dscCircuitProof The DSC circuit proof data.
     */
    function registerDscKeyCommitment(
        bytes32 attestationId,
        uint256 dscCircuitVerifierId,
        IDscCircuitVerifier.DscCircuitProof memory dscCircuitProof
    ) external;

    /**
     * @notice Sets verification config in V2 storage (owner only)
     * @dev The configId is automatically generated from the config content using sha256(abi.encode(config))
     * @param config The verification configuration
     * @return configId The generated config ID
     */
    function setVerificationConfigV2(
        SelfStructs.VerificationConfigV2 memory config
    ) external returns (bytes32 configId);

    /**
     * @notice Main verification function with new structured input format
     * @param baseVerificationInput The base verification input data
     * @param userContextData The user context data
     */
    function verify(bytes calldata baseVerificationInput, bytes calldata userContextData) external;

    /**
     * @notice Updates the registry address.
     * @param attestationId The attestation ID.
     * @param registryAddress The new registry address.
     */
    function updateRegistry(bytes32 attestationId, address registryAddress) external;

    /**
     * @notice Updates the VC and Disclose circuit verifier address.
     * @param attestationId The attestation ID.
     * @param vcAndDiscloseCircuitVerifierAddress The new VC and Disclose circuit verifier address.
     */
    function updateVcAndDiscloseCircuit(bytes32 attestationId, address vcAndDiscloseCircuitVerifierAddress) external;

    /**
     * @notice Updates the register circuit verifier for a specific signature type.
     * @param attestationId The attestation identifier.
     * @param typeId The signature type identifier.
     * @param verifierAddress The new register circuit verifier address.
     */
    function updateRegisterCircuitVerifier(bytes32 attestationId, uint256 typeId, address verifierAddress) external;

    /**
     * @notice Updates the DSC circuit verifier for a specific signature type.
     * @param attestationId The attestation identifier.
     * @param typeId The signature type identifier.
     * @param verifierAddress The new DSC circuit verifier address.
     */
    function updateDscVerifier(bytes32 attestationId, uint256 typeId, address verifierAddress) external;

    /**
     * @notice Batch updates register circuit verifiers.
     * @param attestationIds An array of attestation identifiers.
     * @param typeIds An array of signature type identifiers.
     * @param verifierAddresses An array of new register circuit verifier addresses.
     */
    function batchUpdateRegisterCircuitVerifiers(
        bytes32[] calldata attestationIds,
        uint256[] calldata typeIds,
        address[] calldata verifierAddresses
    ) external;

    /**
     * @notice Batch updates DSC circuit verifiers.
     * @param attestationIds An array of attestation identifiers.
     * @param typeIds An array of signature type identifiers.
     * @param verifierAddresses An array of new DSC circuit verifier addresses.
     */
    function batchUpdateDscCircuitVerifiers(
        bytes32[] calldata attestationIds,
        uint256[] calldata typeIds,
        address[] calldata verifierAddresses
    ) external;

    // ====================================================
    // External View Functions
    // ====================================================

    /**
     * @notice Returns the registry address for a given attestation ID.
     * @param attestationId The attestation ID to query.
     * @return The registry address associated with the attestation ID.
     */
    function registry(bytes32 attestationId) external view returns (address);

    /**
     * @notice Returns the disclose verifier address for a given attestation ID.
     * @param attestationId The attestation ID to query.
     * @return The disclose verifier address associated with the attestation ID.
     */
    function discloseVerifier(bytes32 attestationId) external view returns (address);

    /**
     * @notice Returns the register circuit verifier address for a given attestation ID and type ID.
     * @param attestationId The attestation ID to query.
     * @param typeId The type ID to query.
     * @return The register circuit verifier address associated with the attestation ID and type ID.
     */
    function registerCircuitVerifiers(bytes32 attestationId, uint256 typeId) external view returns (address);

    /**
     * @notice Returns the DSC circuit verifier address for a given attestation ID and type ID.
     * @param attestationId The attestation ID to query.
     * @param typeId The type ID to query.
     * @return The DSC circuit verifier address associated with the attestation ID and type ID.
     */
    function dscCircuitVerifiers(bytes32 attestationId, uint256 typeId) external view returns (address);

    /**
     * @notice Returns the merkle root timestamp for a given attestation ID and root.
     * @param attestationId The attestation ID to query.
     * @param root The merkle root to query.
     * @return The merkle root timestamp associated with the attestation ID and root.
     */
    function rootTimestamp(bytes32 attestationId, uint256 root) external view returns (uint256);

    /**
     * @notice Returns the identity commitment merkle root for a given attestation ID.
     * @param attestationId The attestation ID to query.
     * @return The identity commitment merkle root associated with the attestation ID.
     */
    function getIdentityCommitmentMerkleRoot(bytes32 attestationId) external view returns (uint256);

    /**
     * @notice Checks if a verification config exists
     * @param configId The configuration identifier
     * @return exists Whether the config exists
     */
    function verificationConfigV2Exists(bytes32 configId) external view returns (bool exists);

    // ====================================================
    // Public Functions
    // ====================================================

    /**
     * @notice Generates a config ID from a verification config
     * @param config The verification configuration
     * @return The generated config ID (sha256 hash of encoded config)
     */
    function generateConfigId(SelfStructs.VerificationConfigV2 memory config) external pure returns (bytes32);
}

// lib/self/contracts/contracts/abstract/SelfVerificationRoot.sol

/**
 * @title SelfVerificationRoot
 * @notice Abstract base contract to be integrated with self's verification infrastructure
 * @dev Provides base functionality for verifying and disclosing identity credentials
 * @author Self Team
 */
abstract contract SelfVerificationRoot is ISelfVerificationRoot {
    // ====================================================
    // Constants
    // ====================================================

    /// @notice Contract version identifier used in verification process
    /// @dev This version is included in the hub data for protocol compatibility
    uint8 constant CONTRACT_VERSION = 2;

    // ====================================================
    // Storage Variables
    // ====================================================

    /// @notice The scope value that proofs must match
    /// @dev Used to validate that submitted proofs match the expected scope
    uint256 internal _scope;

    /// @notice Reference to the identity verification hub V2 contract
    /// @dev Immutable reference used for bytes-based proof verification
    IIdentityVerificationHubV2 internal immutable _identityVerificationHubV2;

    // ====================================================
    // Errors
    // ====================================================

    /// @notice Error thrown when the data format is invalid
    /// @dev Triggered when the provided bytes data doesn't have the expected format
    error InvalidDataFormat();

    /// @notice Error thrown when onVerificationSuccess is called by an unauthorized address
    /// @dev Only the identity verification hub V2 contract can call onVerificationSuccess
    error UnauthorizedCaller();

    // ====================================================
    // Events
    // ====================================================

    /**
     * @notice Initializes the SelfVerificationRoot contract
     * @dev Sets up the immutable reference to the hub contract and generates scope automatically
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed string to be hashed with contract address to generate the scope
     */
    constructor(address identityVerificationHubV2Address, string memory scopeSeed) {
        _identityVerificationHubV2 = IIdentityVerificationHubV2(identityVerificationHubV2Address);
        _scope = _calculateScope(address(this), scopeSeed, _getPoseidonAddress());
    }

    /**
     * @notice Returns the current scope value
     * @dev Public view function to access the current scope setting
     * @return The scope value that proofs must match
     */
    function scope() public view returns (uint256) {
        return _scope;
    }

    /**
     * @notice Verifies a self-proof using the bytes-based interface
     * @dev Parses relayer data format and validates against contract settings before calling hub V2
     * @param proofPayload Packed data from relayer in format: | 32 bytes attestationId | proof data |
     * @param userContextData User-defined data in format: | 32 bytes destChainId | 32 bytes userIdentifier | data |
     * @custom:data-format proofPayload = | 32 bytes attestationId | proofData |
     * @custom:data-format userContextData = | 32 bytes destChainId | 32 bytes userIdentifier | data |
     * @custom:data-format hubData = | 1 bytes contract version | 31 bytes buffer | 32 bytes scope | 32 bytes attestationId | proofData |
     */
    function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) public {
        // Minimum expected length for proofData: 32 bytes attestationId + proof data
        if (proofPayload.length < 32) {
            revert InvalidDataFormat();
        }

        // Minimum userDefinedData length: 32 (destChainId) + 32 (userIdentifier) + 0 (userDefinedData) = 64 bytes
        if (userContextData.length < 64) {
            revert InvalidDataFormat();
        }

        bytes32 attestationId;
        assembly {
            // Load attestationId from the beginning of proofData (first 32 bytes)
            attestationId := calldataload(proofPayload.offset)
        }

        bytes32 destinationChainId = bytes32(userContextData[0:32]);
        bytes32 userIdentifier = bytes32(userContextData[32:64]);
        bytes memory userDefinedData = userContextData[64:];

        bytes32 configId = getConfigId(destinationChainId, userIdentifier, userDefinedData);

        // Hub data should be | 1 byte contractVersion | 31 bytes buffer | 32 bytes scope | 32 bytes attestationId | proof data
        bytes memory baseVerificationInput = abi.encodePacked(
            // 1 byte contractVersion
            CONTRACT_VERSION,
            // 31 bytes buffer (all zeros)
            bytes31(0),
            // 32 bytes scope
            _scope,
            proofPayload
        );

        // Call hub V2 verification
        _identityVerificationHubV2.verify(baseVerificationInput, bytes.concat(configId, userContextData));
    }

    /**
     * @notice Callback function called upon successful verification by the hub contract
     * @dev Only callable by the identity verification hub V2 contract for security
     * @param output The verification output data containing disclosed identity information
     * @param userData The user-defined data passed through the verification process
     * @custom:security Only the authorized hub contract can call this function
     * @custom:flow This function decodes the output and calls the customizable verification hook
     */
    function onVerificationSuccess(bytes memory output, bytes memory userData) public {
        // Only allow the identity verification hub V2 to call this function
        if (msg.sender != address(_identityVerificationHubV2)) {
            revert UnauthorizedCaller();
        }

        ISelfVerificationRoot.GenericDiscloseOutputV2 memory genericDiscloseOutput = abi.decode(
            output,
            (ISelfVerificationRoot.GenericDiscloseOutputV2)
        );

        // Call the customizable verification hook
        customVerificationHook(genericDiscloseOutput, userData);
    }

    /**
     * @notice Generates a configId for the user
     * @dev This function should be overridden by the implementing contract to provide custom configId logic
     * @param destinationChainId The destination chain ID
     * @param userIdentifier The user identifier
     * @param userDefinedData The user defined data
     * @return The configId
     */
    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view virtual returns (bytes32) {
        // Default implementation reverts; must be overridden in derived contract
        revert("SelfVerificationRoot: getConfigId must be overridden");
    }

    /**
     * @notice Custom verification hook that can be overridden by implementing contracts
     * @dev This function is called after successful verification and hub address validation
     * @param output The verification output data from the hub containing disclosed identity information
     * @param userData The user-defined data passed through the verification process
     * @custom:override Override this function in derived contracts to add custom verification logic
     * @custom:security This function is only called after proper authentication by the hub contract
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual {
        // Default implementation is empty - override in derived contracts to add custom logic
    }

    /**
     * @notice Gets the PoseidonT3 library address for the current chain
     * @dev Returns hardcoded addresses of pre-deployed PoseidonT3 library on current chain
     * @dev For local development networks, should create a setter function to set the scope manually
     * @return The address of the PoseidonT3 library on this chain
     */
    function _getPoseidonAddress() internal view returns (address) {
        uint256 chainId = block.chainid;

        // Celo Mainnet
        if (chainId == 42220) {
            return 0xF134707a4C4a3a76b8410fC0294d620A7c341581;
        }

        // Celo Sepolia
        if (chainId == 11142220) {
            return 0x0a782f7F9f8Aac6E0bacAF3cD4aA292C3275C6f2;
        }

        // For local/development networks or other chains, return zero address
        return address(0);
    }

    /**
     * @notice Calculates scope from contract address, scope seed, and PoseidonT3 address
     * @param contractAddress The contract address to hash
     * @param scopeSeed The scope seed string
     * @param poseidonT3Address The address of the PoseidonT3 library to use
     * @return The calculated scope value
     */
    function _calculateScope(
        address contractAddress,
        string memory scopeSeed,
        address poseidonT3Address
    ) internal view returns (uint256) {
        // Skip calculation if PoseidonT3 address is zero (local development)
        if (poseidonT3Address == address(0)) {
            return 0;
        }

        uint256 addressHash = _calculateAddressHashWithPoseidon(contractAddress, poseidonT3Address);
        uint256 scopeSeedAsUint = SelfUtils.stringToBigInt(scopeSeed);
        return IPoseidonT3(poseidonT3Address).hash([addressHash, scopeSeedAsUint]);
    }

    /**
     * @notice Calculates hash of contract address using frontend-compatible chunking with specific PoseidonT3
     * @dev Converts address to hex string, splits into 2 chunks (31+11), and hashes with provided PoseidonT3
     * @param addr The contract address to hash
     * @param poseidonT3Address The address of the PoseidonT3 library to use
     * @return The hash result equivalent to frontend's endpointHash for addresses
     */
    function _calculateAddressHashWithPoseidon(
        address addr,
        address poseidonT3Address
    ) internal view returns (uint256) {
        // Convert address to hex string (42 chars: "0x" + 40 hex digits)
        string memory addressString = SelfUtils.addressToHexString(addr);

        // Split into exactly 2 chunks: 31 + 11 characters
        // Chunk 1: characters 0-30 (31 chars)
        // Chunk 2: characters 31-41 (11 chars)
        uint256 chunk1BigInt = SelfUtils.stringToBigInt(Formatter.substring(addressString, 0, 31));
        uint256 chunk2BigInt = SelfUtils.stringToBigInt(Formatter.substring(addressString, 31, 42));

        return IPoseidonT3(poseidonT3Address).hash([chunk1BigInt, chunk2BigInt]);
    }
}

// src/OpenbandsV2AgeRegistry.sol

/**
 * @title OpenbandsV2AgeRegistry
 * @notice Registry contract for storing Self.xyz age verification data
 * @dev Inherits from SelfVerificationRoot V2 for automatic proof verification via Self.xyz Hub
 *      Age verification (18+) is disclosed as a public output from the ZK proof and stored on-chain
 */
contract OpenbandsV2AgeRegistry is SelfVerificationRoot, Ownable {
    
    // ====================================================
    // Storage Variables
    // ====================================================
    
    /// @notice Age verification record for a verified user
    struct AgeRecord {
        bool isAgeVerified;         // Whether user is verified to be 18+
        uint256 verifiedAt;         // Timestamp of verification
        bool isActive;              // Whether record is still active
    }
    
    /// @notice Mapping from user address to their age record
    mapping(address => AgeRecord) public ageRecords;
    
    /// @notice Array of all verified user addresses (for enumeration)
    address[] public verifiedUsers;
    
    /// @notice Total count of active verifications
    uint256 public totalActiveVerifications;
    
    /// @notice Verification configuration stored in wire format
    SelfStructs.VerificationConfigV2 public verificationConfig;
    
    /// @notice Verification config ID for identity verification
    bytes32 public verificationConfigId;
    
    // ====================================================
    // Errors
    // ====================================================
    
    error InvalidAgeVerification();
    error UserNotVerified();
    error InvalidUserIdentifier();
    
    // ====================================================
    // Events
    // ====================================================
    
    event AgeVerificationStored(
        address indexed user,
        bool isAgeVerified,
        uint256 verifiedAt,
        bool isActive
    );
    
    event RecordRevoked(address indexed user, uint256 timestamp);
    
    // ====================================================
    // Constructor
    // ====================================================
    
    /**
     * @notice Constructor for OpenbandsV2AgeRegistry
     * @param identityVerificationHubAddress The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed string (e.g., "openbands-age-v2")
     */
    constructor(
        address identityVerificationHubAddress,
        string memory scopeSeed
    ) SelfVerificationRoot(identityVerificationHubAddress, scopeSeed) Ownable(_msgSender()) {
        
        // Create unformatted config (human-readable)
        string[] memory forbiddenCountries = new string[](0); // No country restrictions
        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,              // Require age 18+ verification
            forbiddenCountries: forbiddenCountries,  // Allow all countries
            ofacEnabled: false          // Disable OFAC for age verification
        });
        
        // Format the config into wire format
        verificationConfig = SelfUtils.formatVerificationConfigV2(rawConfig);
        
        // Register the verification config with the Hub
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubAddress).setVerificationConfigV2(verificationConfig);
    }
    
    // ====================================================
    // View Functions
    // ====================================================
    
    /**
     * @notice Sets the verification config ID
     * @dev Only callable by the contract owner
     * @param configId The verification config ID to set
     */
    function setConfigId(bytes32 configId) external onlyOwner {
        verificationConfigId = configId;
    }
    
    /**
     * @notice Generates a configId for the user
     * @dev Override of the SelfVerificationRoot virtual function
     * @return The stored verification config ID
     */
    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }
    
    /**
     * @notice Get age record for a specific user
     * @param _user Address of the user
     * @return The age record struct
     */
    function getAgeRecord(address _user) external view returns (AgeRecord memory) {
        return ageRecords[_user];
    }
    
    /**
     * @notice Check if a user has verified age (18+)
     * @param _user Address of the user
     * @return True if user is verified to be 18+
     */
    function isUserAgeVerified(address _user) external view returns (bool) {
        return ageRecords[_user].isActive && ageRecords[_user].isAgeVerified;
    }
    
    /**
     * @notice Get all verified user addresses
     * @return Array of verified user addresses
     */
    function getAllVerifiedUsers() external view returns (address[] memory) {
        return verifiedUsers;
    }
    
    /**
     * @notice Retrieves the expected proof scope
     * @return The scope value used for verification
     */
    function getScope() external view returns (uint256) {
        return _scope;
    }
    
    // ====================================================
    // Admin Functions
    // ====================================================
    
    /**
     * @notice Revoke a user's age verification (emergency only)
     * @param _user Address of the user to revoke
     */
    function revokeVerification(address _user) external onlyOwner {
        require(ageRecords[_user].isActive, "User not active");
        
        ageRecords[_user].isActive = false;
        totalActiveVerifications--;
        
        emit RecordRevoked(_user, block.timestamp);
    }
    
    // ====================================================
    // Override Functions from SelfVerificationRoot
    // ====================================================
    
    /**
     * @notice Hook called after successful verification - handles age registration
     * @dev Validates conditions and registers the user's age verification from the ZK proof
     * @param output The verification output containing age verification data
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {
        // Convert userIdentifier (uint256) to address
        // The userIdentifier from Self.xyz is the user's wallet address encoded as uint256
        address user = address(uint160(output.userIdentifier));
        
        // Check if user identifier is valid
        if (output.userIdentifier == 0) {
            revert InvalidUserIdentifier();
        }
        
        // Extract age verification from disclosed attributes
        // The olderThan field indicates if user is 18+ (true) or not (false)
        // Note: olderThan is uint256 in the struct, so we check if it's >= 18
        bool isAgeVerified = output.olderThan >= 18;
        
        // Validate age verification
        if (!isAgeVerified) {
            revert InvalidAgeVerification();
        }
        
        // Check if this is a new user (first verification)
        bool isNewUser = !ageRecords[user].isActive;
        
        // Store the age record (allows re-verification / updates)
        ageRecords[user] = AgeRecord({
            isAgeVerified: isAgeVerified,
            verifiedAt: block.timestamp,
            isActive: true
        });
        
        // Add to verified users array if new user
        if (isNewUser) {
            verifiedUsers.push(user);
            totalActiveVerifications++;
        }
        
        // Emit event for the stored verification
        emit AgeVerificationStored(
            user,
            isAgeVerified,
            block.timestamp,
            true
        );
    }
}

