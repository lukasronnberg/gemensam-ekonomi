from backend.services.splits import compute_shares, net_for_member


def test_equal_split():
    lukas, partner = compute_shares(600, "equal")
    assert (lukas, partner) == (300.0, 300.0)


def test_percent_default_to_half():
    lukas, partner = compute_shares(200, "percent", percent_lukas=None)
    assert (lukas, partner) == (100.0, 100.0)


def test_percent_custom():
    lukas, partner = compute_shares(600, "percent", percent_lukas=0.7)
    assert (lukas, partner) == (420.0, 180.0)


def test_fixed_default_half():
    lukas, partner = compute_shares(500, "fixed", fixed_lukas=None)
    assert (lukas, partner) == (250.0, 250.0)


def test_fixed_given_value():
    lukas, partner = compute_shares(1000, "fixed", fixed_lukas=250)
    assert (lukas, partner) == (250.0, 750.0)


def test_zero_amount():
    lukas, partner = compute_shares(0, "equal")
    assert (lukas, partner) == (0.0, 0.0)


def test_net_for_member():
    assert net_for_member(600, 300) == 300.0
    assert net_for_member(0, 300) == -300.0
