import re


def phone_normalise(phone):
    # input 00447900000000, 07900000000, +447900000000
    # output 447900000000

    tests = [
        ['49\\1', "^\\+49([0-9]+)"],
        ["49\\1", "^0049([0-9]+)"],
        ["49\\1", "^01([0-9]+)"],
        ["49\\1", "^49([0-9]+)"],
        ["44\\1", "^0044([0-9]+)"],
        ["44\\1", "^\\+44([0-9]+)"],
        ["44\\1", "^0(7([0-9]+))"],
        ["44\\1", "^44([0-9]+)"],
    ]

    for test in tests:
        [replace, regex] = test
        if re.match(regex, phone):
            return re.sub(regex, replace, phone)
